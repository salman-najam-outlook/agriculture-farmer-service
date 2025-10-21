import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnchorProvider, Idl, Program, web3, Wallet } from '@coral-xyz/anchor';
import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import {
  CreateTransactionData,
  CreateTransactionResult,
  CropYieldDataOnSolana,
  DeforestationDataOnSolana,
} from './solana.interface';
import { InjectModel } from '@nestjs/sequelize';
import { SolanaTransaction } from './entities/solana-transaction.entity';
import * as moment from 'moment';

import type { DimitraDeforestationProtocolLogMemo } from '../../solana/types/dimitra_deforestation_protocol_log_memo';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Sequelize } from 'sequelize-typescript';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { QueryTypes } from 'sequelize';
import COUNTRIES from 'src/config/country';

@Injectable()
export class SolanaService {
  private authorizedSigner: PublicKey;
  private keypair: Keypair;
  private deforestationIdl: Idl;
  private cropYieldIdl: Idl;
  private provider: AnchorProvider;
  private connection: Connection;
  private deforestationProgram: Program;
  private cropYieldProgram: Program;
  private isSolanaDeforestationProgramInitialized = false;
  private isSolanaCropYieldProgramInitialized = false;
  private readonly logger = new Logger(SolanaService.name);
  private processingTransactions: Set<string | number> = new Set();

  constructor(
    private configService: ConfigService,
    @InjectModel(SolanaTransaction)
    private solanaTransactionModel: typeof SolanaTransaction,
    @InjectQueue(process.env.SOLANA_QUEUE || 'solana-queue') private readonly solanaQueue: Queue,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {
    try {
      const AUTHORIZED_SIGNER = this.configService.get<string>('SOLANA_AUTHORIZED_SIGNER');
      if (!AUTHORIZED_SIGNER)
        throw new Error('SOLANA_PROGRAM_ID and/or SOLANA_AUTHORIZED_SIGNER not provided in environment variables.');
      this.authorizedSigner = new PublicKey(AUTHORIZED_SIGNER);
      this.keypair = this.loadKeypair();

      this.connection = this.connect();
      this.provider = new AnchorProvider(this.connection, new Wallet(this.keypair), {
        preflightCommitment: 'confirmed',
      });
      this.createDeforestationProgram();
      this.createCropYieldProgram();

      this.checkDatabaseConnection();
    } catch (error) {
      this.logger.error('Error initializing SolanaService:', error);
    }
  }

  private createDeforestationProgram() {
    try {
      // Load the IDL from the file system
      this.deforestationIdl = this.loadIdl('deforestation');
      // Create program instance
      this.deforestationProgram = this.createProgram(this.deforestationIdl);
      this.isSolanaDeforestationProgramInitialized = true;
    } catch (error) {
      this.logger.error('Error creating deforestation program:', error);
    }
  }

  private createCropYieldProgram() {
    try {
      // Load the IDL from the file system
      this.cropYieldIdl = this.loadIdl('crop-yield');
      // Create program instance
      this.cropYieldProgram = this.createProgram(this.cropYieldIdl);
      this.isSolanaCropYieldProgramInitialized = true;
    } catch (error) {
      this.logger.error('Error creating crop yield program:', error);
    }
  }

  private async checkDatabaseConnection() {
    try {
      this.logger.log('Checking database connection...');

      // Test database connection
      await this.sequelize.authenticate();
      const description = await this.solanaTransactionModel.describe();
      this.logger.log(`smdescription: ${description}`);
      this.logger.log('Database validation completed successfully');
    } catch (error) {
      this.logger.error('Database connection/validation failed:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  private loadKeypair(): Keypair {
    const keyPairPath = path.resolve(__dirname, '../../solana/auth-keypair.json');
    if (!fs.existsSync(keyPairPath)) {
      throw new Error(`Keypair file not found at ${keyPairPath}`);
    }
    // Load the Keypair from the file system
    const keypairData = JSON.parse(fs.readFileSync(keyPairPath, 'utf8'));
    const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    if (!keypair.publicKey.equals(this.authorizedSigner)) {
      throw new Error(
        `Keypair public key does not match the authorized signer: ${keypair.publicKey.toBase58()} != ${this.authorizedSigner.toBase58()}`
      );
    }
    return keypair;
  }

  private loadIdl(programType: 'deforestation' | 'crop-yield'): Idl {
    const env = this.configService.get<string>('SOLANA_ENV') || 'dev';
    const fileName =
      programType === 'deforestation'
        ? 'dimitra_deforestation_protocol_log_memo.json'
        : 'dimitra_crop_yield_protocol_log_memo.json';
    const idlPath = path.join(__dirname, `../../solana/idl/${env}/${fileName}`);
    if (!fs.existsSync(idlPath)) {
      throw new Error(`Idl file not found at ${idlPath}`);
    }
    // Load the IDL from the file system
    return JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  }

  private connect(): Connection {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || clusterApiUrl('devnet');
    const connection = new Connection(rpcUrl, 'confirmed');
    return connection;
  }

  private createProgram(idl: Idl): Program {
    return new Program(idl as unknown as DimitraDeforestationProtocolLogMemo, this.provider);
  }

  async createTransaction(
    program: Program,
    data: CreateTransactionData,
    retry = 5,
    attempts = 0
  ): Promise<CreateTransactionResult> {
    if (
      (this.deforestationProgram === program && !this.isSolanaDeforestationProgramInitialized) ||
      (this.cropYieldProgram === program && !this.isSolanaCropYieldProgramInitialized)
    ) {
      this.logger.error('SolanaService is not initialized.');
      return {
        success: false,
        attempts,
        error: 'SolanaService is not initialized.',
      };
    }

    this.logger.log(`Creating transaction with data: ${data.transactableId} - ${data.transactableType}`);

    let txnRecord: SolanaTransaction;
    try {
      for (const key in data) {
        if (data[key] === undefined || data[key] === null) {
          delete data[key];
        }
      }

      const { transactableId, transactableType, ...transactionData } = data;
      const dataString = JSON.stringify(transactionData);
      // insert ds to db before sending solana txn - use that as pk and add status - check later after successful txn
      txnRecord = await this.solanaTransactionModel.findOne({
        where: { transactableId, transactableType },
      });

      // Already exists in the database, return the existing record
      if (txnRecord && txnRecord.isSuccess) {
        return {
          success: txnRecord.isSuccess,
          attempts: txnRecord.attempts,
          txId: txnRecord.transactionSignature,
          tx: txnRecord.transactionDetails as any,
        };
      }

      if (!txnRecord) {
        txnRecord = await this.solanaTransactionModel.create({
          transactableId,
          transactableType,
          status: 'processing',
          isSuccess: false,
          attempts: attempts + 1,
          transactionData,
        });
        this.processingTransactions.add(txnRecord.id);
      } else if (txnRecord.transactionSignature) {
        const tx = await this.getTransaction(txnRecord.transactionSignature);
        if (tx) {
          await txnRecord.update({
            isSuccess: true,
            status: 'success',
            transactionFee: tx?.meta?.fee,
            transactionDate: tx?.blockTime ? moment.unix(tx.blockTime).utc() : moment.utc(new Date()),
            transactionDetails: tx,
          });
          this.processingTransactions.delete(txnRecord.id);
          return {
            success: true,
            txId: txnRecord.transactionSignature,
            tx,
            attempts: attempts + 1,
          };
        }
      } else if (txnRecord.status === 'failed') {
        this.processingTransactions.add(txnRecord.id);
      }

      if (!this.processingTransactions.has(txnRecord.id)) {
        // Skip processing if the transaction is already being processed
        return {
          attempts: attempts + 1,
          txId: txnRecord.transactionSignature,
          success: false,
          error: 'Transaction is already being processed.',
        };
      }

      const txId = await program.methods
        .logMemo(dataString)
        .accounts({
          signer: this.keypair.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([this.keypair])
        .rpc();
      txnRecord.transactionSignature = txId;
      await txnRecord.save();

      const blockHash = await this.connection.getLatestBlockhash('confirmed');
      const confirmation = await this.connection.confirmTransaction(
        {
          ...blockHash,
          signature: txId,
        },
        'confirmed'
      );
      if (confirmation.value.err) {
        this.logger.error('Transaction failed:', confirmation.value.err);
        const error =
          typeof confirmation.value.err === 'string' ? { message: confirmation.value.err } : confirmation.value.err;
        const tx = await this.getTransaction(txId);
        if (tx) {
          await txnRecord.update({
            attempts: attempts + 1,
            isSuccess: true,
            status: 'success',
            transactionFee: tx?.meta?.fee,
            transactionDate: tx?.blockTime ? moment.unix(tx.blockTime).utc() : moment.utc(new Date()),
            transactionDetails: tx,
          });
          this.processingTransactions.delete(txnRecord.id);
          return {
            success: true,
            txId,
            tx,
            attempts: attempts + 1,
          };
        }

        if (retry > 0) {
          // Exponential backoff before retrying
          const backoffTime = Math.pow(2, attempts) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          this.logger.error(`Retrying transaction... Attempts left: ${retry}`);
          return await this.createTransaction(program, data, retry - 1, attempts + 1);
        }

        await txnRecord.update({
          isSuccess: false,
          status: 'failed',
          error,
        });
        this.processingTransactions.delete(txnRecord.id);

        return {
          success: false,
          attempts: attempts + 1,
          txId,
          error: confirmation.value.err,
        };
      } else {
        const tx = await this.getTransaction(txId);
        await txnRecord.update({
          attempts: attempts + 1,
          isSuccess: true,
          status: 'success',
          transactionFee: tx?.meta?.fee,
          transactionDate: tx?.blockTime ? moment.unix(tx.blockTime).utc() : moment.utc(new Date()),
          transactionDetails: tx,
        });
        this.processingTransactions.delete(txnRecord.id);

        return {
          success: true,
          txId,
          tx,
          attempts: attempts + 1,
        };
      }
    } catch (error) {
      let errorObj = null;
      try {
        const errorString = JSON.stringify(error);
        errorObj = JSON.parse(errorString);
      } catch (e) {}
      if (txnRecord && (txnRecord.transactionSignature || errorObj?.signature)) {
        try {
          const signature = txnRecord.transactionSignature || errorObj?.signature;
          const tx = await this.getTransaction(signature);
          if (tx) {
            await txnRecord.update({
              isSuccess: true,
              status: 'success',
              transactionFee: tx?.meta?.fee,
              transactionDate: tx?.blockTime ? moment.unix(tx.blockTime).utc() : moment.utc(new Date()),
              transactionDetails: tx,
            });
            this.processingTransactions.delete(txnRecord.id);

            return {
              success: true,
              txId: txnRecord.transactionSignature,
              tx,
              attempts,
            };
          }
        } catch (txError) {
          this.logger.error('Error fetching transaction details:', txError);
        }
      }

      if (
        retry > 0 &&
        ((typeof error?.message === 'string' && error.message.includes('rate limit')) || error?.status === 429)
      ) {
        const delay = 60000;
        this.logger.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await this.createTransaction(program, data, retry - 1, attempts + 1);
      } else if (retry <= 0) {
        await txnRecord.update({
          isSuccess: false,
          status: 'failed',
          error,
        });
        this.processingTransactions.delete(txnRecord.id);

        return {
          success: false,
          attempts: attempts + 1,
          txId: txnRecord.transactionSignature,
          error: error.message || 'Unknown error when creating transaction',
        };
      } else if (retry > 0) {
        // Exponential backoff before retrying
        const backoffTime = Math.pow(2, attempts) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
        this.logger.log(`Retrying transaction... Attempts left: ${retry}`);
        return await this.createTransaction(program, data, retry - 1, attempts + 1);
      }
      this.logger.error('Error creating transaction:', error);
    }
  }

  async getTransaction(txId: string, retry = 5): Promise<web3.TransactionResponse | null> {
    try {
      const response = await this.connection.getTransaction(txId, {
        commitment: 'confirmed',
      });
      return response;
    } catch (error) {
      this.logger.error('Error fetching transaction:', error);
      if (retry > 0) {
        this.logger.log(`Retrying to fetch transaction... Attempts left: ${retry}`);
        return await this.getTransaction(txId, retry - 1);
      }
    }
  }

  async addDeforestationTransactionToQueue(data: DeforestationDataOnSolana, retry = 10, delay = 300) {
    try {
      const jobId = `solana-process-deforestation-${data.transactableType || 'deforestation'}-${data.transactableId}`;
      const existingJob = await this.solanaQueue.getJob(jobId);
      const shouldAddToQueue = existingJob ? await existingJob.isFailed() : true;
      if (shouldAddToQueue) {
        await this.solanaQueue.add('process-deforestation', data, {
          attempts: retry,
          jobId,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          delay,
          removeOnComplete: true,
          removeOnFail: false,
        });
        this.logger.log(`Added deforestation transaction to queue with jobId: ${jobId}`);
      }
      return {
        success: true,
      };
    } catch (error) {
      if (retry <= 0) {
        this.logger.error('Error adding deforestation transaction to queue:', error);
        return {
          success: false,
          error: error.message || 'Unknown error when creating deforestation transaction',
        };
      }
      return this.addDeforestationTransactionToQueue(data, retry - 1);
    }
  }

  async addCropYieldTransactionToQueue(data: CropYieldDataOnSolana, retry = 10, delay = 300) {
    try {
      const jobId = `solana-process-crop-yield-${data.transactableType || 'crop-yield'}-${data.transactableId}`;
      const existingJob = await this.solanaQueue.getJob(jobId);
      const shouldAddToQueue = existingJob ? await existingJob.isFailed() : true;
      if (shouldAddToQueue) {
        await this.solanaQueue.add('process-crop-yield', data, {
          attempts: retry,
          jobId,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          delay,
          removeOnComplete: true,
          removeOnFail: false,
        });
      }
      return {
        success: true,
      };
    } catch (error) {
      if (retry <= 0) {
        return {
          success: false,
          error: error.message || 'Unknown error when creating crop yield transaction',
        };
      }
      return this.addCropYieldTransactionToQueue(data, retry - 1);
    }
  }

  async addDeforestationTransactionFromFile(
    file: Express.Multer.File,
    retry = 10
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const items: Omit<DeforestationDataOnSolana, 'transactableId' | 'transactableType'>[] = JSON.parse(
        file.buffer.toString()
      );
      if (Array.isArray(items)) {
        const isValid = items.every((item) => {
          return (
            item.farm && item.deforestationStatus && item.protectedArea && item.indigenousArea && item.reportVersion
          );
        });

        if (!isValid) {
          throw new Error('Invalid deforestation data format in file');
        }

        for (const item of items) {
          const data: DeforestationDataOnSolana = {
            ...item,
            transactableId: item.farm, // Use farm as transactableId if not provided
            transactableType: 'python-deforestation',
          };
          await this.addDeforestationTransactionToQueue(data, retry);
        }
        return { success: true };
      }
      return {
        success: false,
        error: 'File content is not a valid array of deforestation data',
      };
    } catch (error) {
      this.logger.error('Error adding deforestation transaction from file:', error);
      if (retry <= 0) {
        return {
          success: false,
          error: error.message || 'Unknown error when adding deforestation transaction from file',
        };
      }
      return this.addDeforestationTransactionFromFile(file, retry - 1);
    }
  }

  getEncodedSecretKey(): string | null {
    if (!this.keypair) {
      return null;
    }
    return bs58.encode(this.keypair.secretKey);
  }

  async createDeforestationTransaction(
    data: DeforestationDataOnSolana,
    retry = 5,
    attempts = 0
  ): Promise<CreateTransactionResult> {
    return await this.createTransaction(
      this.deforestationProgram,
      {
        ...data,
        transactableType: data.transactableType || 'deforestation',
      },
      retry,
      attempts
    );
  }

  async createCropYieldTransaction(
    data: CropYieldDataOnSolana,
    retry = 5,
    attempts = 0
  ): Promise<CreateTransactionResult> {
    return await this.createTransaction(
      this.cropYieldProgram,
      {
        ...data,
        transactableType: data.transactableType || 'crop-yield',
      },
      retry,
      attempts
    );
  }

  async getAnalyticsOfTransactableTypeByContinent(type: string) {
    const records = await this.sequelize.query<{
      count: number;
      countryCode: string;
    }>(
      `
        SELECT
          COUNT(st.transactionSignature) as count,
          JSON_UNQUOTE(JSON_EXTRACT(st.transactionData, "$.country")) as countryCode
        FROM
          solana_transactions st
        WHERE
          st.transactableType LIKE :type
          AND st.isSuccess = true
          AND st.transactionSignature IS NOT NULL
          AND JSON_EXTRACT(st.transactionData, "$.country") IS NOT NULL
          AND JSON_UNQUOTE(JSON_EXTRACT(st.transactionData, "$.country")) != '--'
        GROUP BY
          JSON_UNQUOTE(JSON_EXTRACT(st.transactionData, "$.country"))
      `,
      {
        type: QueryTypes.SELECT,
        replacements: { type: `%${type}%` },
      }
    );

    const result: Record<string, { deforestationRecords: number; details: string }> = {
      Asia: {
        deforestationRecords: 0,
        details:
          'Includes all countries on the Asian continent, excluding Russia, which is typically listed with Europe.',
      },
      Europe: {
        deforestationRecords: 0,
        details: 'Includes all countries on the European continent, plus Russia.',
      },
      Africa: {
        deforestationRecords: 0,
        details: 'Includes all countries on the African continent.',
      },
      Oceania: {
        deforestationRecords: 0,
        details: 'Includes Australia, New Zealand, and all island nations in the Pacific Ocean.',
      },
      'North America': {
        deforestationRecords: 0,
        details: 'Includes all countries in North America, Central America, and the Caribbean.',
      },
      'South America': {
        deforestationRecords: 0,
        details: 'Includes all countries on the South American continent.',
      },
    };

    for (const record of records) {
      const country = COUNTRIES.find((country) => country.code === record.countryCode);
      if (country && result[country.continentName]) {
        result[country.continentName].deforestationRecords += record.count;
      }
    }

    return result;
  }
}
