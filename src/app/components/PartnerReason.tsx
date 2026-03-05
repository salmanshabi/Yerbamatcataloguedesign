import { LucideIcon } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface PartnerReasonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function PartnerReason({ icon: Icon, title, description, index = 0 }: PartnerReasonProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: reduced ? 0 : index * 0.09, ease: 'easeOut' }}
      className="flex gap-5 group flex-row-reverse text-right"
    >
      <div className="flex-shrink-0 w-12 h-12 bg-[rgba(200,150,62,0.15)] group-hover:bg-[#C8963E] rounded-xl flex items-center justify-center transition-colors duration-300 mt-1">
        <Icon size={22} className="text-[#C8963E] group-hover:text-white transition-colors duration-300" />
      </div>
      <div className="flex-1 text-right">
        <h3 className="text-white mb-2" style={{ fontFamily: 'Secular One, sans-serif', fontWeight: 400, fontSize: '1.05rem' }}>
          {title}
        </h3>
        <p className="text-[#9DB89F] text-sm leading-relaxed font-bold">{description}</p>
      </div>
    </motion.div>
  );
}
