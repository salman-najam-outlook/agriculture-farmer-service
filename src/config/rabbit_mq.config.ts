import { RABBIT_MQ } from "./constant";

 interface RabbitMqConfigOption {
  urls: string[];
  queue?: string;
  queueOptions: object;
  noAck: boolean;
  persistent: boolean;
}


export const rabbitMqConfigOption = (): RabbitMqConfigOption => {
  return {
    urls: [
      `amqp://${RABBIT_MQ.USERNAME}:${RABBIT_MQ.PASSWORD}@${RABBIT_MQ.HOST}`,
    ],
    noAck: true,
    persistent: true,
    queueOptions: {
      durable: true,
    },
  };
};
