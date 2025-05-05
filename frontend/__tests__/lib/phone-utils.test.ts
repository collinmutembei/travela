import { isValidKenyanPhone, formatPhoneNumber, formatPhoneForDisplay } from "@/lib/phone-utils"

describe("Phone Utilities", () => {
  describe("isValidKenyanPhone", () => {
    it("should validate correct Kenyan phone numbers", () => {
      expect(isValidKenyanPhone("+254712345678")).toBe(true)
      expect(isValidKenyanPhone("+254798765432")).toBe(true)
    })

    it("should reject invalid Kenyan phone numbers", () => {
      expect(isValidKenyanPhone("0712345678")).toBe(false)
      expect(isValidKenyanPhone("+25471234567")).toBe(false) // Too short
      expect(isValidKenyanPhone("+2547123456789")).toBe(false) // Too long
      expect(isValidKenyanPhone("712345678")).toBe(false) // No prefix
      expect(isValidKenyanPhone("+123712345678")).toBe(false) // Wrong prefix
    })
  })

  describe("formatPhoneNumber", () => {
    it("should format phone numbers with leading zero", () => {
      expect(formatPhoneNumber("0712345678")).toBe("+254712345678")
    })

    it("should format phone numbers without prefix", () => {
      expect(formatPhoneNumber("712345678")).toBe("+254712345678")
    })

    it("should keep correctly formatted numbers unchanged", () => {
      expect(formatPhoneNumber("+254712345678")).toBe("+254712345678")
    })

    it("should handle spaces and special characters", () => {
      expect(formatPhoneNumber("0712 345 678")).toBe("+254712345678")
      expect(formatPhoneNumber("0712-345-678")).toBe("+254712345678")
    })
  })

  describe("formatPhoneForDisplay", () => {
    it("should format valid Kenyan numbers for display", () => {
      expect(formatPhoneForDisplay("+254712345678")).toBe("+254 712 345 678")
    })

    it("should return original string for invalid numbers", () => {
      expect(formatPhoneForDisplay("invalid")).toBe("invalid")
    })

    it("should handle empty input", () => {
      expect(formatPhoneForDisplay("")).toBe("")
    })
  })
})
