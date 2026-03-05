import { motion, useReducedMotion } from 'motion/react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  delay?: number;
}

export function AnimatedSection({ children, className, style, id, delay = 0 }: AnimatedSectionProps) {
  const reduced = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      style={style}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: reduced ? 0.1 : 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}
