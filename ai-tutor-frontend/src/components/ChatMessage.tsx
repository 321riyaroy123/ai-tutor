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

class SafeRender extends Component<{ fallback: string; children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false }
  static getDerivedStateFromError() {
    return { crashed: true }
  }
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
    return <span style={{ fontFamily: "monospace", opacity: 0.75 }}>{block ? `$$${src}$$` : `$${src}$`}</span>
  }

  return block ? <div className="katex-block" dangerouslySetInnerHTML={{ __html: html }} /> : <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />
}

const BLOCK_RE = /\$\$([\s\S]+?)\$\$/g
const INLINE_RE = /\$([^$\n]+?)\$/g

function normalizeMathDelimiters(text: string) {
  return text
    .replace(/\\\[((?:.|\n)+?)\\\]/g, (_match, body) => `$$${body}$$`)
    .replace(/\\\((.+?)\\\)/g, (_match, body) => `$${body}$`)
}

function stripAccidentalIndentation(text: string) {
  return text.replace(/^(?: {4}|\t)(?=\S)/gm, "")
}

function renderInlineMath(children: ReactNode, keyPrefix: string): ReactNode {
  if (typeof children === "string") {
    const nodes: ReactNode[] = []
    let last = 0
    let idx = 0

    for (const match of children.matchAll(INLINE_RE)) {
      if (match.index! > last) nodes.push(children.slice(last, match.index))
      nodes.push(<KatexNode key={`${keyPrefix}-k${idx}`} src={match[1]} block={false} />)
      last = match.index! + match[0].length
      idx += 1
    }

    if (last < children.length) nodes.push(children.slice(last))
    return nodes.length > 0 ? nodes : children
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <Fragment key={`${keyPrefix}-${index}`}>{renderInlineMath(child, `${keyPrefix}-${index}`)}</Fragment>
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

const mdComponents = {
  p: ({ children }: { children?: ReactNode }) => <p className="md-para">{renderInlineMath(children, "p")}</p>,
  li: ({ children }: { children?: ReactNode }) => <li>{renderInlineMath(children, "li")}</li>,
  h1: ({ children }: { children?: ReactNode }) => <h1>{renderInlineMath(children, "h1")}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2>{renderInlineMath(children, "h2")}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3>{renderInlineMath(children, "h3")}</h3>,
  blockquote: ({ children }: { children?: ReactNode }) => <blockquote>{renderInlineMath(children, "bq")}</blockquote>,
}

function MathAwareContent({ text }: { text: string }) {
  const normalized = normalizeMathDelimiters(text)
  const nodes: ReactNode[] = []
  let last = 0

  for (const match of normalized.matchAll(BLOCK_RE)) {
    if (match.index! > last) {
      const md = stripAccidentalIndentation(normalized.slice(last, match.index))
      if (md.length > 0) {
        nodes.push(
          <ReactMarkdown key={`m-${last}`} components={mdComponents}>
            {md}
          </ReactMarkdown>,
        )
      }
    }
    nodes.push(<KatexNode key={`b-${match.index}`} src={match[1]} block />)
    last = match.index! + match[0].length
  }

  if (last < normalized.length) {
    const md = stripAccidentalIndentation(normalized.slice(last))
    if (md.length > 0) {
      nodes.push(
        <ReactMarkdown key={`m-last`} components={mdComponents}>
          {md}
        </ReactMarkdown>,
      )
    }
  }

  return <>{nodes}</>
}

const chatStyles = `
  .chat-md { font-size: 0.94rem; line-height: 1.74; color: inherit; }
  .chat-md .md-para { display: block; margin: 0 0 0.6em; }
  .chat-md .md-para:last-child { margin-bottom: 0; }
  .chat-md h1, .chat-md h2, .chat-md h3 { margin: 0.7em 0 0.35em; line-height: 1.25; }
  .chat-md h1 { font-size: 1.24em; }
  .chat-md h2 { font-size: 1.12em; }
  .chat-md h3 { font-size: 1em; }
  .chat-md ul, .chat-md ol { margin: 0.35em 0 0.55em 1.3em; padding: 0; }
  .chat-md li { margin-bottom: 0.22em; }
  .chat-md code {
    font-family: "Cascadia Code", "Fira Code", monospace;
    font-size: 0.84em;
    background: rgba(28,10,0,0.06);
    border-radius: 6px;
    padding: 0.12em 0.38em;
  }
  .chat-md pre {
    background: rgba(28,10,0,0.06);
    border-radius: 10px;
    padding: 0.95em 1em;
    overflow-x: auto;
    margin: 0.6em 0;
  }
  .chat-md pre code { background: transparent; padding: 0; }
  .chat-md strong { font-weight: 700; }
  .chat-md blockquote {
    margin: 0.4em 0;
    padding: 0.2em 0.9em;
    border-left: 3px solid rgba(184,48,96,0.35);
    opacity: 0.84;
  }
  .chat-md .katex-block { margin: 0.65em 0; overflow-x: auto; }
  .chat-md-user code, .chat-md-user pre { background: rgba(255,255,255,0.14); }
  .chat-md-user blockquote { border-left-color: rgba(255,255,255,0.42); }
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
      transition={{ duration: 0.24 }}
      style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "1rem", gap: "0.75rem" }}
    >
      {!isUser && (
        <div
          style={{ width: "2rem", height: "2rem", borderRadius: "50%", display: "grid", placeItems: "center", color: "#fff", fontSize: "0.92rem", boxShadow: "0 10px 20px rgba(184,48,96,0.18)", background: "linear-gradient(108deg, rgba(123, 63, 242, 0.86) 0%, rgba(157, 78, 218, 0.76) 18%, rgba(216, 112, 61, 0.76) 50%, rgba(232, 155, 60, 0.76) 72%, rgba(253, 216, 53, 0.76) 100%)" }}
        >
          ✦
        </div>
      )}

      <div
        className={isUser ? "chat-bubble-user" : "chat-bubble-assistant"}
        style={{
          maxWidth: "min(760px, 88%)",
          borderRadius: isUser ? "1.25rem 1.25rem 0.4rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.4rem",
          padding: "1rem 1.15rem",
          boxShadow: isUser ? "0 14px 28px rgba(184,48,96,0.24)" : "var(--sr-card-shadow)",
        }}
      >
        <style>{chatStyles}</style>
        <div className={`chat-md ${isUser ? "chat-md-user" : ""}`}>
          <SafeRender fallback={content}>
            <MathAwareContent text={content} />
          </SafeRender>
        </div>
      </div>
    </motion.div>
  )
}
