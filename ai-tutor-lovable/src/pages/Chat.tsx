import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, Clock, Sparkles, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import stellaAvatar from "@/assets/stella-avatar.png";

interface Message {
  id: number;
  text: string;
  sender: "user" | "stella";
  timestamp: Date;
}

const subjects = [
  { name: "Mathematics", icon: "📐" },
  { name: "Physics", icon: "⚛️" },
  { name: "Biology", icon: "🧬" },
  { name: "History", icon: "📜" },
  { name: "Literature", icon: "📖" },
  { name: "Chemistry", icon: "🧪" },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Stella, your AI tutor. 👋 What would you like to learn today? Pick a subject or just ask me anything!",
      sender: "stella",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const stellaResponses = [
        "Great question! Let me break that down for you. The key concept here involves understanding the fundamental principles first, then building on them step by step.",
        "That's an interesting topic! Here's what I think will help: start by reviewing the basics, then we can dive into the more complex aspects together.",
        "I love your curiosity! Let me explain this in a way that makes it easy to understand. Think of it like building blocks — each concept connects to the next.",
        "Excellent! This is one of my favorite topics. Let's approach it from a practical angle first, then explore the theory behind it.",
      ];

      const stellaMsg: Message = {
        id: messages.length + 2,
        text: stellaResponses[Math.floor(Math.random() * stellaResponses.length)],
        sender: "stella",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, stellaMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubjectClick = (subject: string) => {
    setInput(`I'd like to learn about ${subject}`);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-r border-border bg-card flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <span className="font-display text-lg font-bold text-foreground">
                  Stella<span className="text-gradient">AI</span>
                </span>
              </Link>
              <Button
                className="w-full gradient-primary text-primary-foreground border-0 rounded-lg text-sm"
                onClick={() => {
                  setMessages([{
                    id: 1,
                    text: "Hi! I'm Stella, your AI tutor. 👋 What would you like to learn today?",
                    sender: "stella",
                    timestamp: new Date(),
                  }]);
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Subjects</p>
              <div className="space-y-1">
                {subjects.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => handleSubjectClick(s.name)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <span>{s.icon}</span>
                    {s.name}
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium text-muted-foreground mb-3 mt-6 uppercase tracking-wider">Recent</p>
              <div className="space-y-1">
                {["Quadratic Equations", "Cell Biology", "World War II"].map((topic) => (
                  <button
                    key={topic}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <Link to="/dashboard">
                <Button variant="outline" className="w-full rounded-lg text-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
          </button>
          <img src={stellaAvatar} alt="Stella" className="w-8 h-8 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-foreground">Stella</p>
            <p className="text-xs text-accent">● Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.sender === "stella" && (
                  <img src={stellaAvatar} alt="Stella" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                )}
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm font-readable leading-relaxed ${
                    msg.sender === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-start"
            >
              <img src={stellaAvatar} alt="Stella" className="w-8 h-8 rounded-full mt-1" />
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex gap-3 items-center max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Stella anything..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-readable placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="gradient-primary text-primary-foreground border-0 rounded-xl h-[46px] w-[46px] p-0 glow-hover"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
