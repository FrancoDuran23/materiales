export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Supabase Auth Errors
    if (error.message.includes("Invalid login credentials")) {
      return "Email o contraseña incorrectos";
    }
    if (error.message.includes("User already registered")) {
      return "Este email ya está registrado";
    }
    if (error.message.includes("Email not confirmed")) {
      return "Debés confirmar tu email antes de continuar";
    }
    if (error.message.includes("duplicate key")) {
      return "Ya existe un registro con estos datos";
    }
    
    // Network Errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return "Error de conexión. Verificá tu internet e intentá de nuevo";
    }

    // Permission Errors
    if (error.message.includes("permission") || error.message.includes("policy")) {
      return "No tenés permisos para realizar esta acción";
    }

    return error.message;
  }

  return "Ocurrió un error inesperado. Intentá de nuevo";
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("fetch") || error.message.includes("network");
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("credentials") ||
      error.message.includes("authentication") ||
      error.message.includes("unauthorized")
    );
  }
  return false;
}
