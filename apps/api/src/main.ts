import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const getAllowedOrigins = () => {
  const corsOrigin = process.env.CORS_ORIGIN;

  if (!corsOrigin) {
    return ["http://localhost:5173"];
  }

  return corsOrigin.split(",").map((origin) => origin.trim());
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: getAllowedOrigins(),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3333);
  await app.listen(port);
}

void bootstrap();
