import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import stellaAvatar from "@/assets/stella-avatar.png";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="gradient-primary rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-foreground/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-foreground/5 blur-2xl" />
          </div>

          <div className="relative z-10">
            <img
              src={stellaAvatar}
              alt="Stella AI tutor"
              className="w-20 h-20 rounded-full mx-auto mb-6 border-4 border-primary-foreground/20 animate-bounce-gentle"
            />
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Ready to Learn Smarter?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8 font-readable">
              Join thousands of students already learning with Stella. Start your personalized journey today.
            </p>
            <Link to="/chat">
              <Button
                size="lg"
                className="bg-card text-foreground hover:bg-card/90 rounded-full px-8 h-12 text-base font-medium glow-hover"
              >
                Chat with Stella Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
