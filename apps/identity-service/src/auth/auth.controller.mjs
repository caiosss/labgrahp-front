import { registerSchema } from "./auth.schemas.mjs";
import {
  EmailIsRegisteredError,
  registerUser,
} from "./auth.service.mjs";


export const register = async (request, response, next) => {
  try {
    const validation = registerSchema.safeParse(request.body);

    if (!validation.success) {
      response.status(400).json({
        message: "Dados de cadastro inválidos.",
        errors: validation.error.flatten(),
      });

      return;
    }

    const user = await registerUser(validation.data);

    response.status(201).json({
      user,
    });
  } catch (error) {
    if (error instanceof EmailIsRegisteredError) {
      response.status(409).json({
        message: "Já existe uma conta cadastrada com este e-mail.",
      });

      return;
    }

    next(error);
  }
};