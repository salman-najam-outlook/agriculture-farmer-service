import { Controller, Post, Res, UploadedFile, UseInterceptors, Headers, Body, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { SolanaService } from 'src/solana/solana.service';
import { ConfigService } from '@nestjs/config';
import { SolanaCropYieldInputs } from './dto/crop-yield.input';

require('dotenv').config();

@Controller('api/solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService, private readonly configService: ConfigService) {}

  @Post('/crop-yield')
  async writeBulkDataToSolana(
    @Res() res: Response,
    @Body() cropYieldInputs: SolanaCropYieldInputs,
    @Headers('secret-key') headerSecretKey: string | undefined
  ) {
    try {
      const secretKey = this.solanaService.getEncodedSecretKey();
      const adminSecretKey = this.configService.get<string>('ADMIN_SECRET_KEY');
      if (!secretKey && !adminSecretKey) {
        return res.status(500).json({
          success: false,
          message: 'Solana secret key for admin is not configured.',
        });
      }

      if (!headerSecretKey) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access. Add secret-key header to the request.',
        });
      }
      if (headerSecretKey !== secretKey && headerSecretKey !== adminSecretKey) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access. Mismatch in secret-key.',
        });
      }

      let delay = 0;
      for (const cropYieldInput of cropYieldInputs.items) {
        const { id: transactableId, ...otherInputs } = cropYieldInput;

        await this.solanaService.addCropYieldTransactionToQueue(
          {
            ...otherInputs,
            transactableId,
            transactableType: cropYieldInputs.transactableType || 'python-crop-yield',
          },
          10,
          delay
        );
        delay += 15000; // 15 seconds delay between each transaction
      }

      return res.status(200).json({
        success: true,
        message: 'Crop yield data successfully added to queue for processing.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing the request.',
      });
    }
  }

  @Get('/crop-yield-analytics')
  async getSolanaAnalytics(
    @Res() res: Response,
  ) {
    try {
      const result = await this.solanaService.getAnalyticsOfTransactableTypeByContinent('crop-yield');
      return res.status(200).json({
        success: true,
        message: 'Successfully fetched solana analytics for crop yield reports.',
        data: result,
      });
    } catch (error) {
      console.error('Error in getSolanaAnalytics:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while fetching solana analytics for crop yield reports.',
      });
    }
  }
}
