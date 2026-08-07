import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);
const projectServiceUrl = process.env.PROJECT_SERVICE_URL ?? "http://localhost:3333";
const identityServiceUrl = process.env.IDENTITY_SERVICE_URL ?? "http://localhost:3334";
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const routeRequest = (pathname) => {
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return identityServiceUrl;
  }

  // Sessões anônimas continuam no serviço legado durante a migração.
  if (["/sessions", "/projects", "/drafts", "/shares"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )) {
    return projectServiceUrl;
  }

  return null;
};

const setCorsHeaders = (request, response) => {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("access-control-allow-credentials", "true");
    response.setHeader("vary", "Origin");
  }

  response.setHeader("access-control-allow-headers", "authorization, content-type");
  response.setHeader("access-control-allow-methods", "DELETE, GET, OPTIONS, POST, PUT");
};

const readBody = async (request) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? Buffer.concat(chunks) : undefined;
};

createServer(async (request, response) => {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204).end();
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (requestUrl.pathname === "/health") {
    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ service: "api-gateway", status: "ok" }));
    return;
  }

  const upstream = routeRequest(requestUrl.pathname);
  if (!upstream) {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ message: "Rota não encontrada no API Gateway." }));
    return;
  }

  try {
    const headers = new Headers();
    for (const [name, value] of Object.entries(request.headers)) {
      if (value && !["host", "content-length", "connection"].includes(name)) {
        headers.set(name, Array.isArray(value) ? value.join(",") : value);
      }
    }

    headers.set("x-forwarded-host", request.headers.host ?? "");
    headers.set("x-forwarded-proto", "http");

    const body = ["GET", "HEAD"].includes(request.method ?? "GET")
      ? undefined
      : await readBody(request);
    const upstreamResponse = await fetch(`${upstream}${requestUrl.pathname}${requestUrl.search}`, {
      body,
      headers,
      method: request.method,
    });

    upstreamResponse.headers.forEach((value, name) => {
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(name)) {
        response.setHeader(name, value);
      }
    });
    setCorsHeaders(request, response);
    response.writeHead(upstreamResponse.status);
    response.end(Buffer.from(await upstreamResponse.arrayBuffer()));
  } catch (error) {
    console.error("Gateway upstream error", error);
    response.writeHead(502, { "content-type": "application/json" });
    response.end(JSON.stringify({ message: "Serviço temporariamente indisponível." }));
  }
}).listen(port, "::", () => {
  console.log(`API Gateway escutando na porta ${port}`);
});
