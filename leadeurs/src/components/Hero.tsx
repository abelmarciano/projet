import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import HeroReviewsMarquee from "@/components/HeroReviewsMarquee";

import avis1 from "@/assets/avis/avis1.png";
import avis2 from "@/assets/avis/avis2.png";
import avis3 from "@/assets/avis/avis3.png";
import avis4 from "@/assets/avis/avis4.png";
import avis5 from "@/assets/avis/avis5.png";
import avis6 from "@/assets/avis/avis6.png";
import avis7 from "@/assets/avis/avis7.png";
import avis8 from "@/assets/avis/avis8.png";

const avisImages = [avis1, avis2, avis3, avis4, avis5, avis6, avis7, avis8];

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 2,
      delay: 1.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v + suffix;
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, suffix, motionValue, rounded]);

  return <span ref={ref}>0{suffix}</span>;
};

const Particle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 hidden md:block"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
    transition={{ duration: 4 + Math.random() * 2, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

interface HeroProps {
  animationReady?: boolean;
}

const Hero = ({ animationReady = true }: HeroProps) => {
  const classicReveal = (delay: number, y = 24) => ({
    initial: { opacity: 0, y },
    animate: animationReady ? { opacity: 1, y: 0 } : { opacity: 0, y },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="section-dark relative min-h-[100vh] lg:min-h-screen flex items-center justify-center overflow-hidden pb-16 lg:pb-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[hsl(var(--background))]" />
        {/* Main glow */}
        <motion.div
          className="absolute top-[20%] left-[15%] w-[700px] h-[700px] rounded-full blur-[200px]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Secondary glow */}
        <motion.div
          className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating particles */}
      <Particle delay={0} x="10%" y="20%" size={4} />
      <Particle delay={1} x="85%" y="30%" size={3} />
      <Particle delay={0.5} x="70%" y="60%" size={5} />
      <Particle delay={1.5} x="25%" y="70%" size={3} />
      <Particle delay={2} x="50%" y="15%" size={4} />
      <Particle delay={0.8} x="90%" y="75%" size={3} />
      <Particle delay={1.2} x="5%" y="50%" size={4} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 pt-28 pb-8 lg:pt-32 lg:pb-16 relative z-20">
        <div className="max-w-5xl mx-auto text-center space-y-5 md:space-y-7">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.97 }}
            animate={animationReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 15, scale: 0.97 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm"
          >
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={animationReady ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-white/70 text-xs md:text-sm font-medium tracking-wide">
              Agence de vente de leads qualifiés
            </span>
          </motion.div>

          {/* Title */}
          <div className="space-y-1 md:space-y-2">
            <motion.h1
              {...classicReveal(0.35, 30)}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-heading font-bold leading-[1.02] tracking-tight"
            >
              <span className="text-white">Achetez des leads</span>
            </motion.h1>
            <motion.h1
              {...classicReveal(0.55, 30)}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-heading font-bold leading-[1.02] tracking-tight"
            >
              <span className="gradient-text-animated">100% qualifiés</span>
            </motion.h1>
            <motion.p
              {...classicReveal(0.75, 20)}
              className="text-xl sm:text-3xl md:text-4xl font-heading font-bold text-white/40"
            >
              et exclusifs.
            </motion.p>
          </div>

          {/* Subtitle */}
          <motion.p
            {...classicReveal(0.95, 18)}
            className="text-sm md:text-lg lg:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
          >
            Des prospects <strong className="text-white font-semibold">vérifiés, exclusifs</strong> et livrés en temps réel directement dans votre CRM. Vous ne payez que les leads reçus.
          </motion.p>

          {/* Single CTA - WhatsApp */}
          <motion.div {...classicReveal(1.1, 20)} className="flex justify-center pt-2">
            <a
              href="https://wa.me/33782170781?text=Bonjour%2C%20je%20souhaite%20recevoir%20des%20leads%20qualifi%C3%A9s.%20Pouvez-vous%20me%20recontacter%20%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium text-base h-14 px-10 rounded-full inline-flex items-center gap-3 font-semibold text-white group"
            >
              Contactez-nous
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>

          {/* Scrolling testimonial screenshots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="pt-8 md:pt-10"
          >
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-white/30 font-medium mb-3">
              Ce que disent nos clients
            </p>
            <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[hsl(220_14%_9%)] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[hsl(220_14%_9%)] to-transparent z-10 pointer-events-none" />
              <HeroReviewsMarquee images={avisImages} />
            </div>
          </motion.div>

          {/* Trust stats - below marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pt-6 md:pt-8 max-w-4xl mx-auto"
          >
            {[
              { value: 250, suffix: "K+", label: "Leads vendus" },
              { value: 2, suffix: "M€+", label: "Investis en pub" },
              { value: 98, suffix: "%", label: "Satisfaction" },
              { value: 24, suffix: "h", label: "Livraison max" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + idx * 0.1 }}
                className="text-center p-3 md:p-5 rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold gradient-text">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] sm:text-xs text-white/40 mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 cursor-pointer z-30"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5 text-primary/50" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
