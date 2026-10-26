import { motion } from "framer-motion";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  /** Render as span to embed inside h2 */
  as?: "span" | "div";
}

const TextReveal = ({ children, className = "", delay = 0, as = "div" }: TextRevealProps) => {
  const words = children.split(" ");
  const Tag = as === "span" ? motion.span : motion.div;

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

export default TextReveal;
