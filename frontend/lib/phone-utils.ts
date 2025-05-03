/**
 * Utility functions for phone number validation and formatting
 */

/**
 * Validates if a phone number is in the correct Kenyan format
 * @param phone - The phone number to validate
 * @returns True if the phone number is valid
 */
export const isValidKenyanPhone = (phone: string): boolean => {
  // Check if the phone number starts with +254 followed by 9 digits
  const phoneRegex = /^\+254\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * Formats a phone number to ensure it has the +254 prefix
 * @param phone - The phone number to format
 * @returns The formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove any spaces or special characters
  const cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "")

  // If the number already starts with +254, return it as is
  if (cleaned.startsWith("+254")) {
    return cleaned
  }

  // If the number starts with 0, replace it with +254
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+254${cleaned.substring(1)}`
  }

  // If the number is just 9 digits, add +254
  if (/^\d{9}$/.test(cleaned)) {
    return `+254${cleaned}`
  }

  // Otherwise return the original input
  return cleaned
}

/**
 * Formats a phone number for display
 * @param phone - The phone number to format
 * @returns The formatted phone number for display
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return ""

  // If it's a valid Kenyan number, format it nicely
  if (isValidKenyanPhone(phone)) {
    const digits = phone.substring(4) // Remove +254
    return `+254 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
  }

  return phone
}
