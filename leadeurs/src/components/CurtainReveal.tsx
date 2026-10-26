import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

interface CurtainRevealProps {
  children: (animationReady: boolean) => React.ReactNode;
}

const CurtainReveal = ({ children }: CurtainRevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [startFill, setStartFill] = useState(false);

  useEffect(() => {
    const fillTimer = setTimeout(() => setStartFill(true), 100);
    const revealTimer = setTimeout(() => setIsRevealed(true), 1500);

    return () => {
      clearTimeout(fillTimer);
      clearTimeout(revealTimer);
    };
  }, []);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isRevealed ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {children(isRevealed)}
      </motion.div>

      <AnimatePresence>
        {!isRevealed && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Glow subtil - simplifié pour mobile */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(253, 188, 0, 0.3) 0%, transparent 70%)',
              }}
            />

            <div className="relative flex flex-col items-center gap-6">
              {/* Logo container avec effet de remplissage via transform */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 overflow-hidden">
                {/* Logo grisé en arrière-plan */}
                <img
                  src={logo}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain opacity-15 grayscale"
                />

                {/* Masque qui révèle le logo coloré de bas en haut */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    willChange: 'transform',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      transform: startFill ? 'translateY(0%)' : 'translateY(100%)',
                      transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      willChange: 'transform',
                    }}
                  >
                    <img
                      src={logo}
                      alt="Leadeurs"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Ligne de progression simple */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-primary"
                  style={{
                    bottom: startFill ? '100%' : '0%',
                    transition: 'bottom 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    opacity: startFill ? 1 : 0,
                    boxShadow: '0 0 8px 2px rgba(253, 188, 0, 0.5)',
                    willChange: 'bottom, opacity',
                  }}
                />
              </div>

              {/* Texte LEADEURS */}
              <span
                className="font-bold text-xl md:text-2xl tracking-[0.3em]"
                style={{
                  opacity: startFill ? 1 : 0,
                  transform: startFill ? 'translateY(0)' : 'translateY(15px)',
                  transition: 'opacity 0.5s ease-out 0.6s, transform 0.5s ease-out 0.6s',
                  background: "linear-gradient(180deg, #FDBC00 0%, #FF8B00 50%, #EC2700 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                LEADEURS
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurtainReveal;