import { motion, useInView } from "framer-motion";
import { Target, UserCheck, Zap, ArrowRight } from "lucide-react";
import { useRef } from "react";
import TextReveal from "@/components/TextReveal";

const steps = [
  {
    icon: Target,
    step: "01",
    title: "On cible vos prospects",
    description: "Campagnes Google & Meta ultra-ciblées pour attirer les personnes intéressées par vos services.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Le prospect s'inscrit",
    description: "Le prospect remplit un formulaire qualifié. On vérifie chaque lead : numéro, intention, critères.",
    accent: "from-orange-500 to-red-500",
  },
  {
    icon: Zap,
    step: "03",
    title: "Vous le recevez",
    description: "Le lead arrive en temps réel par email, CRM, Google Sheets ou API. Vous n'avez plus qu'à closer.",
    accent: "from-red-500 to-rose-500",
  },
];

const AnimatedConnector = ({ inView }: { inView: boolean }) => (
  <div className="hidden lg:flex absolute top-16 -right-3 z-10 items-center">
    <motion.div
      className="h-[2px] w-12 bg-gradient-to-r from-primary/60 to-primary/20 origin-left"
      initial={{ scaleX: 0 }}
      animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
      transition={{ duration: 0.4, delay: 1.2 }}
    >
      <ArrowRight className="w-5 h-5 text-primary/40" />
    </motion.div>
  </div>
);

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="section-dark section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220_12%_9%)] via-[hsl(220_14%_13%)] to-[hsl(220_12%_9%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[200px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium uppercase tracking-widest mb-5 border border-primary/20">
            Notre processus
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-5 text-white">
            <TextReveal as="span">Comment</TextReveal>{" "}
            <span className="gradient-text"><TextReveal as="span" delay={0.2}>ça marche</TextReveal></span>{" "}
            <TextReveal as="span" delay={0.35}>?</TextReveal>
          </h2>
          <p className="text-lg text-white/50">
            Un processus simple en 3 étapes. Vous achetez des leads, on s'occupe du reste.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-0">
            {steps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="relative"
              >
                {/* Animated connector */}
                {idx < steps.length - 1 && <AnimatedConnector inView={isInView} />}

                <div className="text-center lg:px-8 group">
                  {/* Step circle with pulse */}
                  <div className="relative inline-flex mb-5 md:mb-8">
                    {/* Glow pulse behind */}
                    <motion.div
                      className={`absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-br ${step.accent} opacity-0 blur-xl`}
                      animate={isInView ? { opacity: [0, 0.3, 0], scale: [0.8, 1.3, 0.8] } : {}}
                      transition={{ duration: 3, delay: idx * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className={`w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br ${step.accent} p-[1px]`}
                      whileHover={{ scale: 1.08, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-full h-full rounded-2xl md:rounded-3xl bg-[hsl(220_14%_11%)] flex items-center justify-center">
                        <step.icon className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                      </div>
                    </motion.div>
                    <motion.span
                      className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-bold text-white shadow-lg shadow-primary/30"
                      style={{ background: "var(--gradient-primary)" }}
                      initial={{ scale: 0, rotate: -20 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 400, delay: 0.4 + idx * 0.2 }}
                    >
                      {step.step}
                    </motion.span>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-white mb-2 md:mb-3">{step.title}</h3>
                  <p className="text-xs md:text-sm text-white/45 leading-relaxed max-w-[250px] mx-auto">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
