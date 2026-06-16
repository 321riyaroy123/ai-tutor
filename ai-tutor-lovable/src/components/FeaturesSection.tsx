import { motion } from "framer-motion";
import { Brain, BookOpen, BarChart3, MessageCircle, Target, Lightbulb } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "Stella adjusts difficulty and style based on how you learn, ensuring optimal progress.",
  },
  {
    icon: MessageCircle,
    title: "Interactive Chat",
    description: "Ask questions naturally. Stella explains complex topics in simple, digestible steps.",
  },
  {
    icon: BookOpen,
    title: "Lesson Library",
    description: "Browse curated lessons across subjects — math, science, languages, and more.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Visual dashboards show your growth, streaks, and areas for improvement.",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set learning goals and milestones. Stella keeps you accountable and motivated.",
  },
  {
    icon: Lightbulb,
    title: "Smart Quizzes",
    description: "AI-generated quizzes that test comprehension and reinforce key concepts.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Everything You Need to{" "}
            <span className="text-gradient">Excel</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-readable">
            Stella combines cutting-edge AI with proven educational methods to create
            the perfect learning experience.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow duration-300">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-readable text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
