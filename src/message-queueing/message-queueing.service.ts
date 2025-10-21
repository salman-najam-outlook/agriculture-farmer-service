import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import * as amqp from "amqplib";
import { FarmsService } from "src/farms/farms.service";
import { UsersDdsService } from "src/users/users-dds.service";

@Injectable()
export class MessageQueueingService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly EXCHANGE_NAME = "dds-exchange";
  private readonly USER_QUEUE = process.env.USER_QUEUE || "user-queue";
  private readonly FARM_QUEUE = process.env.FARM_QUEUE || "farm-queue";
  private readonly NOTIFICATION_QUEUE = process.env.NOTIFICATION_QUEUE || "notification-queue";
  private readonly ORG_QUEUE = "org-queue";
  private readonly USER_ROUTING_KEY = "user";
  private readonly FARM_ROUTING_KEY = "farm";
  private readonly ORG_ROUTING_KEY = "organization";
  private readonly NOTIFICATION_ROUTING_KEY = "notification";

  constructor(
    private readonly userService: UsersDdsService,
    private readonly farmService: FarmsService
  ) {}

  async onModuleInit() {
    try {
      console.log("RABBITMQ_USERNAME:", process.env.RABBITMQ_USERNAME);
      console.log("RABBITMQ_PASSWORD:", process.env.RABBITMQ_PASSWORD);
      console.log("RABBITMQ_HOST:", process.env.RABBITMQ_HOST);
      console.log("RABBITMQ_PORT:", process.env.RABBITMQ_PORT);
  
      const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
      const rabbitmqPort = '5672';
      const rabbitmqUsername = process.env.RABBITMQ_USERNAME;
      const rabbitmqPassword = process.env.RABBITMQ_PASSWORD;
  
      const amqpUrl = `amqp://${rabbitmqUsername}:${rabbitmqPassword}@${rabbitmqHost}:${rabbitmqPort}/`;
      console.log("Connecting to RabbitMQ with URL:", amqpUrl);
  
      this.connection = await amqp.connect(amqpUrl);

      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.EXCHANGE_NAME, "direct", {
        durable: true,
      });

      // Set up consumers for user and farm queues
      await this.consumeQueue(
        this.USER_QUEUE,
        this.USER_ROUTING_KEY,
        this.handleUserMessage
      );

      // Farms service's (performAddFarmAsync) was also handling farm messages so this was causing duplication of farm data
      // await this.consumeQueue(this.FARM_QUEUE, this.FARM_ROUTING_KEY, this.handleFarmMessage);

      // await this.consumeQueue(this.ORG_QUEUE, this.ORG_ROUTING_KEY, this.handleOrganizationMessage);
      console.log("Successfully initialized message queues.");
    } catch (error) {
      console.log(`Error initializing message queue: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    if(this.channel) await this.channel.close();
    if(this.connection) await this.connection.close();
  }

  private async consumeQueue(
    queueName: string,
    routingKey: string,
    handleMessage: (msg: amqp.Message) => void
  ) {
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, this.EXCHANGE_NAME, routingKey);

    console.log(`Waiting for messages in ${queueName}`);

    this.channel.consume(queueName, (msg) => {
      if (msg !== null) {
        handleMessage(msg);
        this.channel.ack(msg);
      }
    });
  }

  private handleUserMessage = (msg: amqp.Message) => {
    const userDetail = msg.content.toString();

    console.log(`Received message in ${this.USER_QUEUE}: ${userDetail}`);
    // Handle user logic here
    if (userDetail) {
      const parsedData = JSON.parse(userDetail);
      
      if (parsedData.action === 'DELETE') {
        // Check if it's a hard delete
        if (parsedData.hardDelete === true) {
          this.userService.hardDeleteUserFromDDS(parsedData);
        } else {
          // Soft delete (default)
          this.userService.deleteUserFromDDS(parsedData);
        }
      } else {
        // Regular sync/create/update
        this.userService.synchronizeUserDetails(parsedData);
      }
    }
  };

  // private handleFarmMessage = (msg: amqp.Message) => {
  //   const farmData = msg.content.toString()
  //     console.log(`Received message in ${this.FARM_QUEUE}: ${farmData}`);
  //     // Handle farm logic here
  //     if(farmData)
  //       this.farmService.syncFarmFromCF(JSON.parse(farmData))
  // };
  //
  // private handleOrganizationMessage = (msg: amqp.Message) => {
  //     console.log(`Received message in ${this.ORG_QUEUE}: ${msg.content.toString()}`);
  //     // Handle organization logic here
  // };

  // PRODUCER METHODS
  async publishNotification(notificationPayload: {
    userId: string|number;
    title: string;
    type: string;
    notify: string;
    message: string;
    users: Array<string | number>;
    data?: string;
    alertType?: 'notification' | 'alert'
  }) {
    const message = Buffer.from(JSON.stringify(notificationPayload));
    console.log(`Publishing message to ${this.EXCHANGE_NAME} with routing key ${this.NOTIFICATION_ROUTING_KEY}`);
    await this.channel?.publish(this.EXCHANGE_NAME, this.NOTIFICATION_ROUTING_KEY, message, {
      persistent: true,
    });
  }
}
