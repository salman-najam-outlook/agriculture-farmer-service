import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { NestExpressApplication } from "@nestjs/platform-express";
import { UpdateUserIdMiddleware } from "./core/middleware/update-user-id.middleware";
import { json } from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.setBaseViewsDir(`${__dirname}/deforestation/view`);
  app.setViewEngine("ejs");

   app.use(json({ limit: '50mb' }));

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: rabbitMqConfigOption(),
  // });

  // const config = new DocumentBuilder()
  //   .setTitle("Dimitra")
  //   .setDescription("Dimitra REST API documentation")
  //   .setVersion("1.0")
  //   .addBearerAuth()
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);

  // SwaggerModule.setup("api-docs", app, document, {
  //   swaggerOptions: { tagsSorter: "alpha", operationsSorter: "alpha" },
  // });
  
  const timeoutInMs =
    process.env.SERVER_TIMEOUT && !isNaN(parseInt(process.env.SERVER_TIMEOUT))
      ? parseInt(process.env.SERVER_TIMEOUT)
      : 300000;
  app.getHttpServer().setTimeout(timeoutInMs);
  app.enableCors({
    origin: "*"
  });
  app.getHttpAdapter().get('/api', (req, res) => {
    res.send({
        message: 'Hello World!'
    });
});
  console.log(`listening on port ${process.env.SERVICE_PORT}`);
  app.enableShutdownHooks();
  await app.listen(process.env.SERVICE_PORT);
  // await app.startAllMicroservices();
}
bootstrap();
