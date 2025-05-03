"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  numInputs: number
}

export function OtpInput({ value, onChange, numInputs }: OtpInputProps) {
  const [activeInput, setActiveInput] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, numInputs)
  }, [numInputs])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value

    if (val === "") {
      // Handle backspace
      const newValue = value.substring(0, index) + value.substring(index + 1)
      onChange(newValue)

      // Move to previous input if not the first
      if (index > 0) {
        setActiveInput(index - 1)
      }
    } else {
      // Only accept digits
      const digit = val.replace(/[^0-9]/g, "").substring(0, 1)

      if (digit) {
        // Update the value
        const newValue = value.substring(0, index) + digit + value.substring(index + 1)
        onChange(newValue)

        // Move to next input if not the last
        if (index < numInputs - 1) {
          setActiveInput(index + 1)
        }
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      setActiveInput(index - 1)
    } else if (e.key === "ArrowLeft" && index > 0) {
      // Move to previous input on left arrow
      setActiveInput(index - 1)
      e.preventDefault()
    } else if (e.key === "ArrowRight" && index < numInputs - 1) {
      // Move to next input on right arrow
      setActiveInput(index + 1)
      e.preventDefault()
    }
  }

  const handleFocus = (index: number) => {
    setActiveInput(index)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Only accept digits
    const digits = pastedData.replace(/[^0-9]/g, "").substring(0, numInputs)

    if (digits) {
      // Pad with existing value if pasted data is shorter than numInputs
      const newValue = digits.padEnd(numInputs, value.substring(digits.length))
      onChange(newValue.substring(0, numInputs))

      // Focus on the next empty input or the last input
      const focusIndex = Math.min(digits.length, numInputs - 1)
      setActiveInput(focusIndex)
    }
  }

  // Focus on active input
  useEffect(() => {
    inputRefs.current[activeInput]?.focus()
  }, [activeInput])

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: numInputs }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={() => handleFocus(index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-semibold bg-secondary/50"
        />
      ))}
    </div>
  )
}
