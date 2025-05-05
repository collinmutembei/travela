import { render, screen, fireEvent, waitFor } from "../test-utils"
import AuthPage from "@/app/auth/page"
import { useRouter } from "next/navigation"

// Mock the API calls
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe("Authentication Flow", () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    localStorage.clear()
  })

  it("redirects to chat if already authenticated", async () => {
    localStorage.setItem("token", "test-token")

    render(<AuthPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/chat")
    })
  })

  it("shows phone number input form initially", async () => {
    render(<AuthPage />)

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    })

    expect(screen.getByText("Sign In")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Phone Number")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send OTP" })).toBeInTheDocument()
  })

  it("validates phone number format", async () => {
    // Mock the toast function
    const mockToast = jest.fn()
    jest.mock("@/components/ui/use-toast", () => ({
      toast: mockToast,
    }))

    render(<AuthPage />)

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText("Phone Number")
    const button = screen.getByRole("button", { name: "Send OTP" })

    // Enter invalid phone number
    fireEvent.change(input, { target: { value: "123" } })
    fireEvent.click(button)

    // Should not make API call with invalid number
    expect(fetch).not.toHaveBeenCalled()
  })

  it("sends OTP request and shows verification form", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    render(<AuthPage />)

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText("Phone Number")
    const button = screen.getByRole("button", { name: "Send OTP" })

    // Enter valid phone number
    fireEvent.change(input, { target: { value: "+254712345678" } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/request-otp"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("+254712345678"),
        }),
      )
    })

    // Should show OTP verification form
    expect(screen.getByText("Verification")).toBeInTheDocument()
  })

  it("verifies OTP and redirects to chat", async () => {
    // First mock the OTP request
    const mockOtpResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce(mockOtpResponse)

    // Then mock the verification response
    const mockVerifyResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        access_token: "test-token",
        token_type: "bearer",
      }),
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce(mockVerifyResponse)

    render(<AuthPage />)

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
    })

    // Send OTP
    const phoneInput = screen.getByPlaceholderText("Phone Number")
    fireEvent.change(phoneInput, { target: { value: "+254712345678" } })
    fireEvent.click(screen.getByRole("button", { name: "Send OTP" }))

    await waitFor(() => {
      expect(screen.getByText("Verification")).toBeInTheDocument()
    })

    // Enter OTP (we need to simulate entering digits in each input)
    const otpInputs = screen.getAllByRole("textbox")
    fireEvent.change(otpInputs[0], { target: { value: "1" } })
    fireEvent.change(otpInputs[1], { target: { value: "2" } })
    fireEvent.change(otpInputs[2], { target: { value: "3" } })
    fireEvent.change(otpInputs[3], { target: { value: "4" } })
    fireEvent.change(otpInputs[4], { target: { value: "5" } })
    fireEvent.change(otpInputs[5], { target: { value: "6" } })

    // Click verify
    fireEvent.click(screen.getByRole("button", { name: "Verify" }))

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token")
      expect(mockPush).toHaveBeenCalledWith("/chat")
    })
  })
})
