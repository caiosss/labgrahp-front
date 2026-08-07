import cookieParser from "cookie-parser";
import express from "express";
import { prisma } from "./database/prisma.mjs";
import { authRouter } from "./auth/auth.routes.mjs";

const port = Number(process.env.PORT ?? 3334);
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());

app.get("/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.json({
      database: "connected",
      service: "identity-service",
      status: "ok",
    });
  } catch (error) {
    console.error("Falha no health check do banco de identidade.", error);

    response.status(503).json({
      database: "disconnected",
      service: "identity-service",
      status: "error",
    });
  }
});

const notImplemented = (request, response) => {
  response.status(501).json({
    message: "Contrato reservado: implemente esta etapa no Identity Service.",
    route: `${request.method} ${request.path}`,
  });
};


app.use("/auth", authRouter);
app.post("/auth/login", notImplemented);
app.get("/auth/google", notImplemented);
app.get("/auth/google/callback", notImplemented);
app.post("/auth/refresh", notImplemented);
app.post("/auth/logout", notImplemented);

app.use((_request, response) => {
  response.status(404).json({
    message: "Rota não encontrada.",
  });
});


app.use((error, _request, response, _next) => {
  console.error("Erro não tratado no Identity Service.", error);

  if (response.headersSent) {
    return _next(error);
  }

  response.status(500).json({
    message: "Erro interno do Identity Service.",
  });
});

const server = app.listen(port, "::", () => {
  console.log(`Identity Service escutando na porta ${port}`);
});

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Recebido ${signal}. Encerrando Identity Service...`);

  server.close(async (error) => {
    if (error) {
      console.error("Erro ao encerrar o servidor HTTP.", error);
      process.exitCode = 1;
    }

    try {
      await prisma.$disconnect();
      console.log("Identity Service encerrado.");
    } catch (disconnectError) {
      console.error("Erro ao desconectar o Prisma.", disconnectError);
      process.exitCode = 1;
    }
  });
};

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});
