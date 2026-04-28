import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { LotteryResult } from './lottery-types';

interface LotterySuccessProps {
  result: LotteryResult;
}

export default function LotterySuccess({ result }: LotterySuccessProps) {
  return result.kind === 'winner' ? (
    <WinnerPanel amount={result.amount} />
  ) : (
    <NonWinnerPanel />
  );
}

function WinnerPanel({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
      className="rounded-2xl p-8 md:p-10 text-center flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(200,150,62,0.35)',
        boxShadow: '0 12px 40px -20px rgba(200,150,62,0.45)',
        minHeight: '380px',
      }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, delay: 0.15 }}
        className="text-5xl md:text-6xl mb-4"
        aria-hidden="true"
      >
        🎉
      </motion.div>

      <h3
        className="mb-1"
        style={{
          fontFamily: 'Secular One, sans-serif',
          color: '#1C2B1E',
          fontSize: '1.5rem',
        }}
      >
        מזל טוב!
      </h3>

      <p className="text-sm mb-5" style={{ color: '#5A7260' }}>
        זכית בקופון בשווי
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex items-baseline justify-center gap-1 mb-6"
      >
        <span
          style={{
            fontFamily: 'Secular One, sans-serif',
            color: '#C8963E',
            fontSize: 'clamp(2.5rem, 9vw, 3.5rem)',
            lineHeight: 1,
          }}
        >
          {amount.toLocaleString('he-IL')}
        </span>
        <span
          style={{
            fontFamily: 'Secular One, sans-serif',
            color: '#C8963E',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            lineHeight: 1,
          }}
        >
          ₪
        </span>
      </motion.div>

      <div
        className="rounded-xl px-4 py-3 text-xs leading-relaxed flex items-start gap-2 text-right"
        style={{
          backgroundColor: 'rgba(200,150,62,0.1)',
          color: '#1C2B1E',
          maxWidth: '340px',
        }}
      >
        <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: '#C8963E' }} />
        <span>יש להציג את ההודעה הזו בקופה למימוש הפרס.</span>
      </div>
    </motion.div>
  );
}

function NonWinnerPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      role="status"
      aria-live="polite"
      className="rounded-2xl p-8 md:p-10 text-center flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(44,84,50,0.1)',
        minHeight: '380px',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
        className="text-5xl mb-4"
        aria-hidden="true"
      >
        😔
      </motion.div>

      <h3
        className="mb-3"
        style={{
          fontFamily: 'Secular One, sans-serif',
          color: '#1C2B1E',
          fontSize: '1.4rem',
        }}
      >
        לא זכית הפעם
      </h3>

      <p
        className="text-sm"
        style={{ color: '#5A7260', maxWidth: '320px', lineHeight: 1.7 }}
      >
        הקוד שלך ממשיך להשתתף בהגרלה הבאה שתתקיים בקרוב.
      </p>
    </motion.div>
  );
}
