// Input validation utilities for backend

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Phone validation
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Password validation
export function validatePassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128
}

// UUID validation
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Price validation
export function validatePrice(price: number): boolean {
  return price > 0 && price <= 10000 && !isNaN(price)
}

// Age validation
export function validateAge(age: number): boolean {
  return age >= 18 && age <= 100 && Number.isInteger(age)
}

// String length validation
export function validateStringLength(str: string, min: number, max: number): boolean {
  return str.trim().length >= min && str.trim().length <= max
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

// Validate ad data
export function validateAdData(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.name || !validateStringLength(data.name, 5, 200)) {
    errors.name = "Name must be 5-200 characters"
  }

  if (!data.description || !validateStringLength(data.description, 20, 5000)) {
    errors.description = "Description must be 20-5000 characters"
  }

  if (data.rates_per_hour && !validatePrice(data.rates_per_hour)) {
    errors.rates_per_hour = "Invalid price"
  }

  if (data.age && !validateAge(data.age)) {
    errors.age = "Age must be 18-100"
  }

  if (data.city && !validateStringLength(data.city, 2, 100)) {
    errors.city = "Invalid city"
  }

  if (data.state && (typeof data.state !== "string" || data.state.length !== 2)) {
    errors.state = "Invalid state code"
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

// Validate coordinates
export function validateCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}
