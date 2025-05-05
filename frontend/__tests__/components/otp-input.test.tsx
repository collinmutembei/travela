"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { OtpInput } from "@/components/otp-input"

describe("OtpInput Component", () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the correct number of inputs", () => {
    render(<OtpInput value="" onChange={mockOnChange} numInputs={6} />)
    const inputs = screen.getAllByRole("textbox")
    expect(inputs).toHaveLength(6)
  })

  it("displays the provided value", () => {
    render(<OtpInput value="123" onChange={mockOnChange} numInputs={6} />)
    const inputs = screen.getAllByRole("textbox")

    expect(inputs[0]).toHaveValue("1")
    expect(inputs[1]).toHaveValue("2")
    expect(inputs[2]).toHaveValue("3")
    expect(inputs[3]).toHaveValue("")
  })

  it("calls onChange when typing digits", () => {
    render(<OtpInput value="" onChange={mockOnChange} numInputs={6} />)
    const inputs = screen.getAllByRole("textbox")

    fireEvent.change(inputs[0], { target: { value: "1" } })
    expect(mockOnChange).toHaveBeenCalledWith("1")

    // Reset mock to test the second input
    mockOnChange.mockReset()

    // Simulate the component receiving the new value
    render(<OtpInput value="1" onChange={mockOnChange} numInputs={6} />)
    const updatedInputs = screen.getAllByRole("textbox")

    fireEvent.change(updatedInputs[1], { target: { value: "2" } })
    expect(mockOnChange).toHaveBeenCalledWith("12")
  })

  it("handles backspace correctly", () => {
    render(<OtpInput value="123" onChange={mockOnChange} numInputs={6} />)
    const inputs = screen.getAllByRole("textbox")

    fireEvent.change(inputs[2], { target: { value: "" } })
    expect(mockOnChange).toHaveBeenCalledWith("12")
  })

  it("handles paste event", () => {
    render(<OtpInput value="" onChange={mockOnChange} numInputs={6} />)
    const inputs = screen.getAllByRole("textbox")

    const pasteEvent = {
      clipboardData: {
        getData: () => "123456",
      },
      preventDefault: jest.fn(),
    }

    fireEvent.paste(inputs[0], pasteEvent)
    expect(mockOnChange).toHaveBeenCalledWith("123456")
    expect(pasteEvent.preventDefault).toHaveBeenCalled()
  })

  it("only accepts numeric input", () => {
    render(<OtpInput value="" onChange={mockOnChange} numInputs={6} />)
    const inputs = screen.getAllByRole("textbox")

    fireEvent.change(inputs[0], { target: { value: "a" } })
    expect(mockOnChange).not.toHaveBeenCalled()

    fireEvent.change(inputs[0], { target: { value: "1" } })
    expect(mockOnChange).toHaveBeenCalledWith("1")
  })
})
