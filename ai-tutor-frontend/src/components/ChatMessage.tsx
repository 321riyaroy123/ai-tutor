import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import katex from "katex"
import {
  cloneElement,
  Component,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"

class SafeRender extends Component<
  { fallback: string; children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false }
  static getDerivedStateFromError() { return { crashed: true } }
  render() {
    if (this.state.crashed) {
      return <span style={{ whiteSpace: "pre-wrap", opacity: 0.75 }}>{this.props.fallback}</span>
    }
    return this.props.children
  }
}

function KatexNode({ src, block }: { src: string; block: boolean }) {
  let html = ""
  try {
    html = katex.renderToString(src.trim(), {
      displayMode: block,
      throwOnError: false,
      output: "html",
    })
  } catch {
    return (
      <span style={{ fontFamily: "monospace", opacity: 0.75 }}>
        {block ? `$$${src}$$` : `$${src}$`}
      </span>
    )
  }

  return block
    ? <div className="katex-block" dangerouslySetInnerHTML={{ __html: html }} />
    : <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />
}

const BLOCK_RE = /\$\$([\s\S]+?)\$\$/g
const INLINE_RE = /\$([^$\n]+?)\$/g

function normalizeMathDelimiters(text: string) {
  return text
    .replace(/\\\[((?:.|\n)+?)\\\]/g, (_m, body) => `$$${body}$$`)
    .replace(/\\\((.+?)\\\)/g, (_m, body) => `$${body}$`)
}

function stripAccidentalIndentation(text: string) {
  // Avoid accidental markdown indented-code blocks from model spacing.
  return text.replace(/^(?: {4}|\t)(?=\S)/gm, "")
}

function renderInlineMath(children: ReactNode, keyPrefix: string): ReactNode {
  if (typeof children === "string") {
    const nodes: ReactNode[] = []
    let last = 0
    let idx = 0

    for (const m of children.matchAll(INLINE_RE)) {
      if (m.index! > last) nodes.push(children.slice(last, m.index))
      nodes.push(<KatexNode key={`${keyPrefix}-k${idx}`} src={m[1]} block={false} />)
      last = m.index! + m[0].length
      idx += 1
    }

    if (last < children.length) nodes.push(children.slice(last))
    return nodes.length > 0 ? nodes : children
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <Fragment key={`${keyPrefix}-f${i}`}>
        {renderInlineMath(child, `${keyPrefix}-${i}`)}
      </Fragment>
    ))
  }

  if (isValidElement(children)) {
    const el = children as ReactElement<{ children?: ReactNode }>
    if (typeof el.type === "string" && (el.type === "pre" || el.type === "code")) {
      return el
    }
    return cloneElement(el, {
      ...el.props,
      children: renderInlineMath(el.props.children, `${keyPrefix}-c`),
    })
  }

  return children
}

const MD_COMPONENTS = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="md-para">{renderInlineMath(children, "p")}</p>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li>{renderInlineMath(children, "li")}</li>
  ),
  h1: ({ children }: { children?: ReactNode }) => (
    <h1>{renderInlineMath(children, "h1")}</h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2>{renderInlineMath(children, "h2")}</h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3>{renderInlineMath(children, "h3")}</h3>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote>{renderInlineMath(children, "bq")}</blockquote>
  ),
}

function MathAwareContent({ text }: { text: string }) {
  const normalized = normalizeMathDelimiters(text)
  const nodes: ReactNode[] = []

  const blockParts: Array<{ type: "text" | "block"; value: string }> = []
  let last = 0

  for (const m of normalized.matchAll(BLOCK_RE)) {
    if (m.index! > last) blockParts.push({ type: "text", value: normalized.slice(last, m.index) })
    blockParts.push({ type: "block", value: m[1] })
    last = m.index! + m[0].length
  }

  if (last < normalized.length) blockParts.push({ type: "text", value: normalized.slice(last) })

  blockParts.forEach((part, i) => {
    if (part.type === "block") {
      nodes.push(<KatexNode key={`b${i}`} src={part.value} block />)
      return
    }

    const md = stripAccidentalIndentation(part.value)
    if (md.length > 0) {
      nodes.push(
        <ReactMarkdown key={`m${i}`} components={MD_COMPONENTS}>
          {md}
        </ReactMarkdown>
      )
    }
  })

  return <>{nodes}</>
}

const CHAT_STYLES = `
  .chat-md { font-size: 0.9rem; line-height: 1.7; color: inherit; }

  .chat-md .md-para             { display: block; margin: 0 0 0.55em; }
  .chat-md .md-para:last-child  { margin-bottom: 0; }

  .chat-md h1, .chat-md h2, .chat-md h3 {
    font-weight: 700; margin: 0.7em 0 0.3em; line-height: 1.3;
  }
  .chat-md h1 { font-size: 1.25em; }
  .chat-md h2 { font-size: 1.1em; }
  .chat-md h3 { font-size: 1.0em; }

  .chat-md ul, .chat-md ol { margin: 0.35em 0 0.55em 1.4em; padding: 0; }
  .chat-md li { margin-bottom: 0.25em; }

  .chat-md code {
    font-family: "Fira Code", "Cascadia Code", monospace;
    font-size: 0.82em;
    background: rgba(0,0,0,0.08);
    border-radius: 4px;
    padding: 0.1em 0.38em;
  }
  .chat-md pre {
    background: rgba(0,0,0,0.08);
    border-radius: 8px;
    padding: 0.85em 1.1em;
    overflow-x: auto;
    margin: 0.55em 0;
  }
  .chat-md pre code    { background: transparent; padding: 0; font-size: 0.85em; }
  .chat-md strong      { font-weight: 700; }
  .chat-md em          { font-style: italic; }
  .chat-md blockquote  {
    border-left: 3px solid rgba(28,111,248,0.45);
    margin: 0.4em 0; padding: 0.2em 0.85em; opacity: 0.82;
  }

  .chat-md .katex-block  { display: block; text-align: center; margin: 0.65em 0; overflow-x: auto; }
  .chat-md .katex-inline { display: inline; vertical-align: middle; }

  .chat-md-user code, .chat-md-user pre        { background: rgba(255,255,255,0.18); }
  .chat-md-user blockquote                     { border-left-color: rgba(255,255,255,0.5); }
`

interface Props {
  role: "user" | "assistant"
  content: string
}

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {!isUser && (
        <div
          className="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full shadow-glow"
          style={{ backgroundImage: "var(--primary-gradient)" }}
          aria-hidden="true"
        />
      )}

      <div
        className={`max-w-2xl rounded-2xl px-5 py-4 shadow-sm ${
          isUser ? "rounded-br-sm text-white" : "academic-panel rounded-bl-sm"
        }`}
        style={isUser ? { backgroundImage: "var(--primary-gradient)" } : undefined}
      >
        <style>{CHAT_STYLES}</style>

        <div className={`chat-md ${isUser ? "chat-md-user" : ""}`}>
          <SafeRender fallback={content}>
            <MathAwareContent text={content} />
          </SafeRender>
        </div>
      </div>
    </motion.div>
  )
}
