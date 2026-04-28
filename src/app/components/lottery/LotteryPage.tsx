import { useState } from 'react';
import { motion } from 'motion/react';
import { Gift } from 'lucide-react';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'motion/react';
import LotteryForm from './LotteryForm';
import LotterySuccess from './LotterySuccess';
import type { LotteryResult } from './lottery-types';

export default function LotteryPage() {
  const [result, setResult] = useState<LotteryResult | null>(null);

  return (
    <div
      dir="rtl"
      lang="he"
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#F8F3EB',
        fontFamily: 'Assistant, sans-serif',
      }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Assistant, sans-serif',
            direction: 'rtl',
          },
        }}
      />

      {/* Hero */}
      <header
        className="text-center pt-10 pb-8 px-5"
        style={{ backgroundColor: '#2C5432' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-4"
        >
          <img
            src="/images/13dc8d557d8360ccddfce8eb7118c03ba57a9655.png"
            alt="Herbalook"
            className="h-14 md:h-16 brightness-0 invert"
            fetchPriority="high"
            loading="eager"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontFamily: 'Secular One, sans-serif',
            color: '#ffffff',
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            lineHeight: 1.3,
          }}
        >
          הגרלה בלעדית ללקוחות Herbalook
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-sm mx-auto"
          style={{
            color: 'rgba(255,255,255,0.75)',
            maxWidth: '380px',
            lineHeight: 1.7,
          }}
        >
          הזינו את הקוד שקיבלתם ומלאו את הפרטים להשתתפות בהגרלה
        </motion.p>
      </header>

      {/* Main content */}
      <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-start gap-3 mb-6 rounded-xl p-4"
          style={{ backgroundColor: 'rgba(44,84,50,0.06)' }}
        >
          <Gift
            size={20}
            className="mt-0.5 shrink-0"
            style={{ color: '#C8963E' }}
          />
          <div className="text-xs leading-relaxed" style={{ color: '#5A7260' }}>
            <strong style={{ color: '#1C2B1E' }}>איך זה עובד?</strong>
            <br />
            מצאו את הקוד בן 6 התווים על המוצר שרכשתם, הזינו אותו למטה, מלאו
            את הפרטים ולחצו על כפתור ההשתתפות. כל קוד תקף לשימוש חד פעמי בלבד.
          </div>
        </motion.div>

        {/* Form / Success */}
        <AnimatePresence mode="wait">
          {result === null ? (
            <LotteryForm key="form" onSuccess={setResult} />
          ) : (
            <LotterySuccess key="result" result={result} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Terms */}
      <footer
        className="text-center py-6 px-5"
        style={{ borderTop: '1px solid rgba(44,84,50,0.08)' }}
      >
        <p className="text-xs leading-relaxed" style={{ color: '#9DB89F', maxWidth: '420px', margin: '0 auto' }}>
          ההשתתפות בהגרלה כפופה לתנאי ההשתתפות. כל קוד קופון תקף לשימוש
          חד פעמי. Herbalook שומרת לעצמה את הזכות לעדכן את תנאי ההגרלה.
        </p>
        <p className="text-xs mt-3" style={{ color: '#c8c0b4' }}>
          &copy; {new Date().getFullYear()} Herbalook
        </p>
      </footer>
    </div>
  );
}
