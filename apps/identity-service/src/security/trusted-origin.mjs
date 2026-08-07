const getAllowedOrigins = () => {
  return (process.env.FRONTEND_URL ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

export const requireTrustedOrigin = (request, response, next) => {
  const origin = request.headers.origin?.replace(/\/$/, "");

  if (!origin || getAllowedOrigins().includes(origin)) {
    next();
    return;
  }

  response.status(403).json({ message: "Origem não autorizada." });
};
