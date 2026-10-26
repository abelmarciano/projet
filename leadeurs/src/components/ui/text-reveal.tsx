import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
}

// Reveal text word by word - simplified for mobile compatibility
export const TextRevealWords = ({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  once = true
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "0px" });

  const text = typeof children === "string" ? children : "";
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline ${className}`}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{
            duration,
            delay: delay + idx * 0.06,
            ease: [0.33, 1, 0.68, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

// Reveal text character by character
export const TextRevealChars = ({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  once = true
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "0px" });

  const text = typeof children === "string" ? children : "";
  const chars = text.split("");

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {chars.map((char, idx) => (
        <motion.span
          key={idx}
          className="inline-block"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{
            duration,
            delay: delay + idx * 0.03,
            ease: [0.33, 1, 0.68, 1],
          }}
          style={{
            display: char === " " ? "inline" : "inline-block",
            whiteSpace: char === " " ? "pre" : "normal"
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
};

// Slide up reveal for blocks
export const TextRevealSlide = ({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  once = true
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "0px" });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Fade blur reveal
export const TextRevealBlur = ({
  children,
  className = "",
  delay = 0,
  duration = 1,
  once = true
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 15 }}
      animate={isInView
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 15 }
      }
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
};
