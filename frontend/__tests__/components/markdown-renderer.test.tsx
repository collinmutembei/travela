import { render, screen } from "../test-utils"
import { MarkdownRenderer } from "@/components/markdown-renderer"

describe("MarkdownRenderer Component", () => {
  it("renders plain text correctly", () => {
    render(<MarkdownRenderer content="Hello world" />)
    expect(screen.getByText("Hello world")).toBeInTheDocument()
  })

  it("renders markdown headings correctly", () => {
    render(<MarkdownRenderer content="# Heading 1\n## Heading 2\n### Heading 3" />)

    expect(screen.getByText("Heading 1")).toBeInTheDocument()
    expect(screen.getByText("Heading 2")).toBeInTheDocument()
    expect(screen.getByText("Heading 3")).toBeInTheDocument()
  })

  it("renders markdown lists correctly", () => {
    render(
      <MarkdownRenderer
        content={`
- Item 1
- Item 2
- Item 3

1. First
2. Second
3. Third
        `}
      />,
    )

    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 2")).toBeInTheDocument()
    expect(screen.getByText("Item 3")).toBeInTheDocument()

    expect(screen.getByText("First")).toBeInTheDocument()
    expect(screen.getByText("Second")).toBeInTheDocument()
    expect(screen.getByText("Third")).toBeInTheDocument()
  })

  it('renders markdown links with target="_blank"', () => {
    render(<MarkdownRenderer content="[Link text](https://example.com)" />)

    const link = screen.getByText("Link text")
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "https://example.com")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders inline code correctly", () => {
    render(<MarkdownRenderer content="This is `inline code`" />)

    const code = screen.getByText("inline code")
    expect(code.tagName).toBe("CODE")
  })

  it("renders code blocks correctly", () => {
    render(
      <MarkdownRenderer
        content={`
\`\`\`
function test() {
  return true;
}
\`\`\`
        `}
      />,
    )

    const code = screen.getByText("function test() {\n  return true;\n}")
    expect(code.tagName).toBe("CODE")
  })

  it("renders blockquotes correctly", () => {
    render(<MarkdownRenderer content="> This is a blockquote" />)

    const blockquote = screen.getByText("This is a blockquote")
    expect(blockquote.closest("blockquote")).toBeInTheDocument()
  })

  it("applies custom className when provided", () => {
    const { container } = render(<MarkdownRenderer content="Test" className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
