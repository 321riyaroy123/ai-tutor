import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Atom, Sigma, Diamond, Settings, Moon, Sun, LogOut, 
  ArrowRight, Activity, Gauge, Clock, Coins, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "react-router-dom";
import stellaAvatar from "@/assets/stella-avatar.png";

const navItems = [
  { name: "Physics Tutor", icon: Atom, path: "/chat" },
  { name: "Math Tutor", icon: Sigma, path: "/chat" },
  { name: "Progress", icon: Diamond, path: "/dashboard" },
  { name: "Settings", icon: Settings, path: "/dashboard" },
];

const cards = [
  {
    title: "Physics Tutor",
    icon: Atom,
    description: "Explore mechanics, fields, and conceptual reasoning with guided steps.",
    path: "/chat",
  },
  {
    title: "Math Tutor",
    icon: Sigma,
    description: "Practice algebra, calculus, and proofs with clear explanations.",
    path: "/chat",
  },
  {
    title: "Progress Tracker",
    icon: Diamond,
    description: "Review completion trends and confidence growth over recent sessions.",
    path: "/dashboard",
  },
  {
    title: "Settings",
    icon: Settings,
    description: "Adjust dark mode, readable scaling, and dyslexia-friendly typography.",
    path: "/dashboard",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-accent/30 via-primary/20 to-accent/40 overflow-hidden">
      {/* Left Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-64 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col shrink-0"
      >
        <div className="p-5 border-b border-border">
          <h1 className="font-display text-xl font-bold text-primary">AI Tutor</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Minimalist academic assistant for focused study sessions.
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((navItem) => (
            <Link
              key={navItem.name}
              to={navItem.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                navItem.name === "Progress"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <navItem.icon className="h-4 w-4" />
              {navItem.name}
            </Link>
          ))}
        </nav>

        <div className="p-3 space-y-2 border-t border-border">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors border border-border"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Dark Mode
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 pb-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Welcome Back
              </h2>
              <p className="text-muted-foreground font-readable mt-2 text-base">
                Stella is ready to help you study — professional, focused, and always at your pace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDark(!isDark)}
                className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Dark Mode
              </button>
              <img
                src={stellaAvatar}
                alt="Stella AI tutor"
                className="w-16 h-16 rounded-full border-3 border-primary/30 shadow-glow"
              />
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-8 pb-8 grid md:grid-cols-2 gap-5"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={item}
              className="group bg-card/90 backdrop-blur-sm rounded-2xl border border-border p-6 hover:shadow-card hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                  <card.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {card.title}
                </h3>
              </div>
              <p className="text-muted-foreground font-readable text-sm leading-relaxed mb-5">
                {card.description}
              </p>
              <Link to={card.path}>
                <Button
                  className="gradient-primary text-primary-foreground border-0 rounded-lg text-sm glow-hover"
                >
                  Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Right Analytics Panel */}
      <motion.aside
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-72 bg-card/80 backdrop-blur-xl border-l border-border shrink-0 flex flex-col p-5 hidden lg:flex"
      >
        <h2 className="font-display text-xl font-bold text-primary mb-1">
          Response Analytics
        </h2>
        <p className="text-xs text-muted-foreground mb-6">Live session stats</p>

        <div className="space-y-5 flex-1">
          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Confidence</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                0%
              </span>
            </div>
            <Progress value={0} className="h-2" />
          </div>

          <div className="border-t border-border" />

          {/* Model Used */}
          <div>
            <p className="text-sm text-muted-foreground">Model Used</p>
            <p className="text-foreground font-medium mt-1">—</p>
          </div>

          <div className="border-t border-border" />

          {/* Latency */}
          <div>
            <p className="text-sm text-muted-foreground">Latency</p>
            <p className="text-foreground font-medium mt-1">—</p>
          </div>

          <div className="border-t border-border" />

          {/* Tokens Used */}
          <div>
            <p className="text-sm text-muted-foreground">Tokens Used</p>
            <p className="text-foreground font-medium mt-1">—</p>
          </div>

          <div className="border-t border-border" />
        </div>

        {/* Tutor online */}
        <div className="flex items-center gap-2 mt-auto pt-4">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse-soft" />
          <span className="text-sm text-muted-foreground">Tutor online</span>
        </div>
      </motion.aside>

      {/* Stella floating mascot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 z-50 lg:right-[300px]"
      >
        <Link to="/chat">
          <div className="relative group cursor-pointer">
            <img
              src={stellaAvatar}
              alt="Chat with Stella"
              className="w-14 h-14 rounded-full shadow-glow border-2 border-primary/30 group-hover:scale-110 transition-transform duration-200"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-md gradient-warm flex items-center justify-center">
              <span className="text-[8px] font-bold text-warning-foreground">1+1</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
