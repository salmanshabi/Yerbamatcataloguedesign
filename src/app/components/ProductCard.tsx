import { useState } from 'react';
import { Tag, X, ZoomIn, Mail } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { Product } from '../data/products';

interface ProductCardProps extends Product {
  index?: number;
}

export function ProductCard({ name, image, weight, description, weights, sku, imageScale, index = 0 }: ProductCardProps) {
  const [localWeight, setLocalWeight] = useState(weight);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const displayWeights = weights && weights.length > 0 ? weights : [weight];
  const reduced = useReducedMotion();

  const staggerDelay = reduced ? 0 : Math.min(index * 0.08, 0.4);

  const requestInfo = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: staggerDelay, ease: 'easeOut' }}
        whileHover={reduced ? {} : { y: -3 }}
        whileTap={reduced ? {} : { scale: 0.98 }}
        className="group/card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
        style={{ border: '1px solid rgba(44,84,50,0.08)' }}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden cursor-zoom-in"
          style={{ aspectRatio: '4/3' }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={image}
            alt={name}
            className="absolute inset-0 w-full h-full object-contain group-hover/card:scale-[1.02] transition-transform duration-500"
            style={imageScale ? { transform: `scale(${imageScale})`, transformOrigin: 'center center' } : undefined}
          />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: 'rgba(30,58,35,0.35)' }}
          >
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.92)' }}>
              <ZoomIn size={20} style={{ color: '#2C5432' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 text-right">
          <h3 className="text-[#1C2B1E] mb-1" style={{ fontFamily: 'Secular One, sans-serif', fontWeight: 400, fontSize: '1.05rem' }}>
            {name}
          </h3>

          <div className="flex items-center justify-end gap-1 mb-3">
            <div className="flex gap-1 flex-wrap justify-end">
              {displayWeights.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLocalWeight(opt)}
                  className="px-2 py-0.5 rounded-full border transition-all text-[15px]"
                  style={
                    localWeight === opt
                      ? { backgroundColor: '#2C5432', color: '#ffffff', borderColor: '#2C5432' }
                      : { backgroundColor: 'transparent', color: '#5A7260', borderColor: 'rgba(90,114,96,0.4)' }
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
            <Tag size={14} style={{ color: '#5A7260', flexShrink: 0 }} />
          </div>

          <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: '#4A5E4D' }}>
            {description}
          </p>

          {/* Request info CTA */}
          <motion.button
            whileTap={reduced ? {} : { scale: 0.97 }}
            whileHover={reduced ? {} : { y: -2 }}
            transition={{ duration: 0.15 }}
            onClick={requestInfo}
            className="w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-opacity duration-200 hover:opacity-85"
            style={{ backgroundColor: '#1E3A23', color: '#F8F3EB', border: 'none', cursor: 'pointer' }}
          >
            <Mail size={14} />
            בקש מידע
          </motion.button>
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(20,35,22,0.88)', backdropFilter: 'blur(6px)' }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              key="lightbox-panel"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: '#F8F3EB', maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
                style={{ backgroundColor: '#1E3A23', color: '#ffffff' }}
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-center p-6" style={{ minHeight: '300px', maxHeight: '60vh' }}>
                <img
                  src={image}
                  alt={name}
                  className="max-w-full max-h-full object-contain rounded-xl"
                  style={{ maxHeight: 'calc(60vh - 3rem)' }}
                />
              </div>

              <div className="px-6 pb-5 text-right" style={{ borderTop: '1px solid rgba(44,84,50,0.1)' }}>
                <p className="pt-4 text-base" style={{ color: '#1C2B1E', fontFamily: 'Secular One, sans-serif', fontWeight: 400 }}>
                  {name}
                </p>
                {sku && <p className="text-xs mt-1" style={{ color: '#5A7260' }}>SKU: {sku}</p>}
                <p className="text-sm mt-3 leading-relaxed" style={{ color: '#4A5E4D' }}>
                  {description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
