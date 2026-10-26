import { motion } from "framer-motion";
import { Shield, Award, Eye, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { useMagneticTilt } from "@/hooks/useMagneticTilt";
import TextReveal from "@/components/TextReveal";

const guarantees = [
  {
    icon: Shield,
    title: "Exclusivité",
    description: "Chaque lead est exclusivement pour votre entreprise. Aucune revente, aucune concurrence.",
    highlight: "0 partage",
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Award,
    title: "Qualité vérifiée",
    description: "Chaque prospect est vérifié : numéro valide, intention confirmée, critères respectés.",
    highlight: "98% valides",
    gradient: "from-orange-500 to-red-500",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: Eye,
    title: "Transparence",
    description: "Dashboard en temps réel, statistiques détaillées et reporting de vos campagnes inclus.",
    highlight: "Suivi 24/7",
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Zap,
    title: "Réactivité",
    description: "Les leads arrivent instantanément dès leur inscription dans votre outil préféré.",
    highlight: "Temps réel",
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
];

const TiltCard = ({ g, idx }: { g: typeof guarantees[0]; idx: number }) => {
  const tilt = useMagneticTilt(12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.12, duration: 0.5 }}
      className="group relative min-w-[280px] w-[280px] sm:w-auto sm:min-w-0 flex-shrink-0 sm:flex-shrink"
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="relative h-full bg-card rounded-2xl border border-border/60 overflow-hidden transition-shadow duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Shine overlay */}
        <div data-shine className="absolute inset-0 z-10 pointer-events-none rounded-2xl" />
        <div className={`h-1 bg-gradient-to-r ${g.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
        <div className={`absolute inset-0 bg-gradient-to-b ${g.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
        <div className="relative p-6 md:p-8 text-center flex flex-col items-center" style={{ transform: "translateZ(30px)" }}>
          <motion.div
            className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${g.iconBg} flex items-center justify-center mb-5`}
            whileHover={{ scale: 1.15, rotate: 8 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <g.icon className={`w-6 h-6 md:w-7 md:h-7 ${g.iconColor}`} />
          </motion.div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${g.gradient} mb-4`}>
            <span className="text-[11px] md:text-xs font-bold text-white tracking-wide">{g.highlight}</span>
          </div>
          <h3 className="text-base md:text-lg font-heading font-bold text-foreground mb-2">{g.title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{g.description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Guarantees = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 280 + 16;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, guarantees.length - 1));
  };

  return (
    <section className="section-padding relative overflow-hidden bg-section-alt">
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/[0.02] rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-10 md:mb-18"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium uppercase tracking-widest mb-5">
            Nos Garanties
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-5">
            <TextReveal as="span">Fini les leads</TextReveal>{" "}
            <span className="gradient-text"><TextReveal as="span" delay={0.3}>pas intéressés</TextReveal></span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Des leads engagés dans une démarche active d'achat, sélectionnés et qualifiés selon vos critères.
          </p>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="sm:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {guarantees.map((g, idx) => (
              <div key={g.title} className="snap-center">
                <TiltCard g={g} idx={idx} />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {guarantees.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? "bg-primary w-6" : "bg-primary/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {guarantees.map((g, idx) => (
            <TiltCard key={g.title} g={g} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guarantees;
