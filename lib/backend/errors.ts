// Error handling utilities for backend

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = "UNKNOWN_ERROR"
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(400, message, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = "Authentication required") {
    super(401, message, "AUTHENTICATION_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = "Access denied") {
    super(403, message, "AUTHORIZATION_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class ConflictError extends APIError {
  constructor(message: string = "Resource already exists") {
    super(409, message, "CONFLICT")
    this.name = "ConflictError"
  }
}

export class RateLimitError extends APIError {
  constructor(
    public retryAfter: number = 60
  ) {
    super(429, "Too many requests", "RATE_LIMIT_EXCEEDED")
    this.name = "RateLimitError"
  }
}

export class ServerError extends APIError {
  constructor(message: string = "Internal server error") {
    super(500, message, "INTERNAL_SERVER_ERROR")
    this.name = "ServerError"
  }
}

// Error response formatter
export function formatErrorResponse(error: any) {
  if (error instanceof APIError) {
    return {
      error: true,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      ...(error instanceof ValidationError && error.fields && { fields: error.fields }),
    }
  }

  console.error("Unhandled error:", error)
  return {
    error: true,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    statusCode: 500,
  }
}

// Safe async handler
export function createAsyncHandler(fn: Function) {
  return async (req: any, res: any) => {
    try {
      return await fn(req, res)
    } catch (error) {
      const formatted = formatErrorResponse(error)
      return res.status(formatted.statusCode).json(formatted)
    }
  }
}
