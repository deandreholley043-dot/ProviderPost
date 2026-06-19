// API response formatter

import { NextResponse } from "next/server"

interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
  meta?: {
    timestamp: string
    path?: string
    method?: string
  }
}

// Success response
export function successResponse<T = any>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  )
}

// Error response
export function errorResponse(
  error: string,
  statusCode: number = 400,
  code: string = "ERROR",
  message?: string
): NextResponse<APIResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      ...(message && { message }),
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  )
}

// Paginated response
export function paginatedResponse<T = any>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  statusCode: number = 200
): NextResponse {
  const totalPages = Math.ceil(total / pageSize)

  return NextResponse.json(
    {
      success: true,
      data: items,
      meta: {
        timestamp: new Date().toISOString(),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    },
    { status: statusCode }
  )
}

// List response
export function listResponse<T = any>(items: T[], count: number = 0): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data: items,
      count: count || items.length,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  )
}

// Created response
export function createdResponse<T = any>(data: T, message: string = "Created successfully") {
  return successResponse(data, 201, message)
}

// Updated response
export function updatedResponse<T = any>(data: T) {
  return successResponse(data, 200, "Updated successfully")
}

// Deleted response
export function deletedResponse() {
  return successResponse(null, 200, "Deleted successfully")
}

// Validation error response
export function validationErrorResponse(errors: Record<string, string>) {
  return errorResponse("Validation failed", 400, "VALIDATION_ERROR")
}

// Not found response
export function notFoundResponse(resource: string = "Resource") {
  return errorResponse(`${resource} not found`, 404, "NOT_FOUND")
}

// Unauthorized response
export function unauthorizedResponse() {
  return errorResponse("Unauthorized", 401, "UNAUTHORIZED")
}

// Forbidden response
export function forbiddenResponse() {
  return errorResponse("Access denied", 403, "FORBIDDEN")
}

// Server error response
export function serverErrorResponse(message: string = "Internal server error") {
  return errorResponse(message, 500, "SERVER_ERROR")
}

// Rate limit response
export function rateLimitResponse(retryAfter: number = 60) {
  const response = errorResponse("Too many requests", 429, "RATE_LIMIT_EXCEEDED")
  response.headers.set("Retry-After", retryAfter.toString())
  return response
}
