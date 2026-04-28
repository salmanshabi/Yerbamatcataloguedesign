import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { supabase } from '../supabase/client';
import { toast } from 'sonner';
import type { LotteryResult } from './lottery-types';

const LOTTERY_SHEET_URL = import.meta.env.VITE_LOTTERY_GOOGLE_SHEET_URL || '';

const inputStyle: React.CSSProperties = {
  backgroundColor: '#EEF5EE',
  border: '1.5px solid rgba(44,84,50,0.15)',
  color: '#1C2B1E',
  transition: 'border-color 0.2s',
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CODE_FORMAT: 'הקוד חייב להיות בן 6 תווים',
  MISSING_FIELDS: 'יש למלא את כל השדות',
  CODE_NOT_FOUND: 'קוד לא תקין. אנא בדוק ונסה שוב.',
  CODE_ALREADY_USED: 'קוד זה כבר נוצל',
  DUPLICATE_PHONE: 'מספר הטלפון כבר רשום להגרלה',
  RATE_LIMITED: 'יותר מדי ניסיונות. נסו שוב בעוד דקה',
  CAMPAIGN_ENDED: 'ההגרלה הסתיימה. תודה רבה לכל המשתתפים!',
};

interface LotteryFormProps {
  onSuccess: (result: LotteryResult) => void;
}

export default function LotteryForm({ onSuccess }: LotteryFormProps) {
  const [code, setCode] = useState('');
  const [venue, setVenue] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const isValid =
    code.length === 6 &&
    venue.trim() !== '' &&
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    phone.trim() !== '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || sending) return;

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^0[5-9]\d{7,8}$/.test(cleanPhone)) {
      toast.error('מספר טלפון לא תקין');
      return;
    }

    setSending(true);

    try {
      const cleanVenue = venue.trim();

      const { data, error } = await supabase.rpc('redeem_lottery_code', {
        p_code: code,
        p_first_name: firstName,
        p_last_name: lastName,
        p_phone: cleanPhone,
        p_venue: cleanVenue,
      });

      if (error) {
        console.error('[lottery] redeem_lottery_code RPC error:', error);
        toast.error('שגיאה בשליחה. נסו שוב.');
        return;
      }

      if (data?.success) {
        const prizeAmount =
          typeof data.prize_amount === 'number' ? data.prize_amount : null;
        const result: LotteryResult =
          prizeAmount !== null
            ? { kind: 'winner', amount: prizeAmount }
            : { kind: 'non_winner' };

        if (LOTTERY_SHEET_URL) {
          fetch(LOTTERY_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              firstName,
              lastName,
              phone: cleanPhone,
              venue: cleanVenue,
              prizeAmount,
              outcome: result.kind,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {});
        }
        onSuccess(result);
      } else {
        const msg = ERROR_MESSAGES[data?.error] ?? 'שגיאה לא צפויה. נסו שוב.';
        toast.error(msg);
      }
    } catch {
      toast.error('שגיאת תקשורת. בדקו את החיבור ונסו שוב.');
    } finally {
      setSending(false);
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#2C5432';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)';
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="rounded-2xl p-8 md:p-10 text-right"
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid rgba(44,84,50,0.1)',
      }}
    >
      {/* Coupon code */}
      <div className="mb-7">
        <label
          className="block text-sm mb-3 text-center font-medium"
          style={{ color: '#1C2B1E' }}
        >
          הזינו את קוד הקופון
        </label>
        <div dir="ltr" className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={setCode}
            containerClassName="gap-2"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className="!w-11 !h-12 !text-lg !rounded-lg !border" />
              <InputOTPSlot index={1} className="!w-11 !h-12 !text-lg !rounded-lg !border" />
              <InputOTPSlot index={2} className="!w-11 !h-12 !text-lg !rounded-lg !border" />
              <InputOTPSlot index={3} className="!w-11 !h-12 !text-lg !rounded-lg !border" />
              <InputOTPSlot index={4} className="!w-11 !h-12 !text-lg !rounded-lg !border" />
              <InputOTPSlot index={5} className="!w-11 !h-12 !text-lg !rounded-lg !border" />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: '#9DB89F' }}>
          הקוד מופיע על המוצר שרכשתם
        </p>
      </div>

      {/* Venue / place of purchase */}
      <div className="mb-7">
        <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>
          מקום הרכישה *
        </label>
        <input
          required
          type="text"
          placeholder="שם החנות או העסק"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none text-right"
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Divider */}
      <div
        className="mb-6"
        style={{ borderTop: '1px solid rgba(44,84,50,0.08)' }}
      />

      {/* Name fields */}
      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>
            שם פרטי *
          </label>
          <input
            required
            type="text"
            placeholder="שם פרטי"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none text-right"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>
            שם משפחה *
          </label>
          <input
            required
            type="text"
            placeholder="שם משפחה"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none text-right"
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="mb-7">
        <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>
          טלפון *
        </label>
        <input
          required
          type="tel"
          placeholder="050-0000000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={!isValid || sending}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#2C5432',
          color: '#ffffff',
          border: 'none',
          cursor: isValid && !sending ? 'pointer' : 'not-allowed',
        }}
      >
        {sending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            שולח...
          </>
        ) : (
          <>
            השתתפו בהגרלה
            <ArrowLeft size={16} />
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
