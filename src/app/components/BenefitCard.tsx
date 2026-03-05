import { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function BenefitCard({ icon: Icon, title, description, index = 0 }: BenefitCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: reduced ? 0 : index * 0.1, ease: 'easeOut' }}
      whileHover={reduced ? {} : { y: -3 }}
      className="group bg-white rounded-2xl p-7 hover:shadow-lg transition-shadow duration-300 border border-[rgba(44,84,50,0.08)] hover:border-[rgba(44,84,50,0.2)] text-right"
    >
      <div className="w-[52px] h-[52px] bg-[#EEF5EE] group-hover:bg-[#2C5432] rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 mr-auto">
        <Icon className="text-[#2C5432] group-hover:text-white transition-colors duration-300" size={24} />
      </div>
      <h3 className="text-[#1C2B1E] mb-2 whitespace-nowrap" style={{ fontFamily: 'Secular One, sans-serif', fontWeight: 400, fontSize: '1.05rem' }}>
        {title}
      </h3>
      <p className="text-[#5A7260] text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}
