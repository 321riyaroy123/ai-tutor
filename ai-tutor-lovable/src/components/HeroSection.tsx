import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import stellaAvatar from "@/assets/stella-avatar.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Powered by Advanced AI
            </motion.div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
              Learn with{" "}
              <span className="text-gradient">Stella</span>
              <br />
              Your AI Tutor
            </h1>

            <p className="font-readable text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Get personalized tutoring in any subject. Stella adapts to your learning style,
              tracks your progress, and helps you master concepts faster.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/chat">
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground border-0 glow-hover rounded-full px-8 text-base font-medium h-12"
                >
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 text-base h-12 border-border hover:bg-muted"
                >
                  View Dashboard
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-background gradient-accent"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">10,000+ students</p>
                <p className="text-xs text-muted-foreground">learning with Stella</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <img
                src={heroIllustration}
                alt="AI-powered learning illustration with books and connections"
                className="w-full animate-float"
                loading="lazy"
              />
              {/* Stella avatar floating card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 shadow-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <img src={stellaAvatar} alt="Stella AI tutor avatar" className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Stella</p>
                    <p className="text-xs text-accent">● Online & ready</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
