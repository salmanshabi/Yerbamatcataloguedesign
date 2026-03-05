import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { Leaf, Star, ChevronLeft, Zap, Shield, Heart, Wind, Sun } from 'lucide-react';

const IGUAZU_IMG  = 'https://images.unsplash.com/photo-1765814255696-6968ac443c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080';
const HERBS_IMG   = 'https://images.unsplash.com/photo-1708667027894-6e9481ae1baf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080';
const MATE_LEAVES = 'https://images.unsplash.com/photo-1691298358916-7f0e4059e27e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZXJiYSUyMG1hdGUlMjBsZWF2ZXMlMjBwbGFudCUyMGNsb3NlJTIwdXB8ZW58MXx8fHwxNzcyNjUyNDg5fDA&ixlib=rb-4.1.0&q=80&w=1080';
const MATE_GOURD  = 'https://images.unsplash.com/photo-1765533088244-37cd08b9524d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZXJiYSUyMG1hdGUlMjBnb3VyZCUyMGN1cCUyMHRyYWRpdGlvbmFsJTIwZHJpbmt8ZW58MXx8fHwxNzcyNjUyNDkwfDA&ixlib=rb-4.1.0&q=80&w=1080';

const mateBenefits = [
  { icon: Zap,    title: 'אנרגיה טבעית', desc: 'מעניקה ערנות ואנרגיה ממושכת ללא עצבנות, בזכות שילוב ייחודי של קפאין וכלורוגני' },
  { icon: Shield, title: 'נוגדי חמצון', desc: 'עשירה בפוליפנולים ונוגדי חמצון החזקים ביותר בטבע — יותר מבתה ירוק' },
  { icon: Heart,  title: 'ויטמינים ומינרלים', desc: 'מכילה ויטמינים A, C, E, B1, B2 ומינרלים חיוניים: סידן, מגנזיום, אשלגן ועוד' },
  { icon: Wind,   title: 'תמיכה בחילוף חומרים', desc: 'תורמת לשיפור חילוף החומרים ולתחושת שובע, ומסייעת למערכת העיכול' },
  { icon: Leaf,   title: '100% טבעי ואורגני', desc: 'צומחת באופן פראי ללא דשנים, ללא ריסוס — טהורה כפי שהטבע יצר אותה' },
  { icon: Sun,    title: 'מסורת של מאות שנים', desc: 'שתייה מסורתית של עמי דרום אמריקה שהפכה לפנומן עולמי בשל יתרונותיה הרבים' },
];

const origins = [
  { country: 'ארגנטינה', flag: '🇦🇷', desc: "מקור ראשי לג׳רבה מאטה אורגנית פראית מיערות האיגואסו" },
  { country: 'פאראגואי', flag: '🇵🇾', desc: 'זנים מסורתיים מובחרים מלב יבשת דרום אמריקה' },
  { country: 'אורוגואי', flag: '🇺🇾', desc: "חליטות פרמיום בסגנון אורוגוואי הידוע בתרבות הג׳רבה מאטה שלו" },
];

interface AboutPageProps {
  onNavigateHome: () => void;
}

export function AboutPage({ onNavigateHome }: AboutPageProps) {
  const reduced = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduced ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' } as const,
    transition: { duration: 0.6, delay, ease: 'easeOut' },
  });

  return (
    <div dir="rtl" lang="he" style={{ fontFamily: 'Assistant, sans-serif' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ minHeight: '60vh', backgroundColor: '#1E3A23' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img src={HERBS_IMG} alt="Herbalook" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(30,58,35,0.97) 0%, rgba(44,84,50,0.85) 60%, rgba(30,58,35,0.7) 100%)' }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 py-20 text-center w-full">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm"
            style={{ backgroundColor: 'rgba(200,150,62,0.2)', color: '#C8963E', border: '1px solid rgba(200,150,62,0.35)', fontWeight: 700 }}
          >
            מאז 1994
            <Leaf size={13} />
          </motion.div>
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="text-white mb-6"
            style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)', fontWeight: 400, lineHeight: 1.2 }}
          >
            הרבלוק —{' '}
            <span style={{ color: '#C8963E' }}>טבעי להתמזג עם הטבע</span>
          </motion.h1>
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: 'easeOut' }}
            className="mx-auto text-lg leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '680px' }}
          >
            חברתנו מתמחה בייבוא ושיווק צמח ג׳רבה מאטה מדרום אמריקה מאז 1994. אנו מאמינים שהטבע מספק את הפתרונות הטובים ביותר לבריאות הגוף והנפש.
          </motion.p>
        </div>
      </section>

      {/* ── OUR STORY ────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#F8F3EB' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp()} className="text-right">
              <p className="mb-4 text-sm" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>הסיפור שלנו</p>
              <h2
                style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: '#1C2B1E', lineHeight: 1.25 }}
                className="mb-6"
              >
                שלושה עשורים של<br />
                <span style={{ color: '#2C5432' }}>תשוקה לג׳רבה מאטה</span>
              </h2>
              <p className="leading-relaxed mb-5" style={{ color: '#4A5E4D', lineHeight: 1.9, fontSize: '1.02rem' }}>
                חברתנו מתמחה בייבוא ושיווק צמח ג׳רבה מאטה מדרום אמריקה מאז 1994. את המוצרים שלנו אנו מייבאים ממפעלים מובחרים בארגנטינה, פאראגואי ואורוגואי.
              </p>
              <p className="leading-relaxed mb-5" style={{ color: '#4A5E4D', lineHeight: 1.9, fontSize: '1.02rem' }}>
                בתקופה האחרונה התחלנו לייבא סוג מיוחד של ג׳רבה מאטה אורגנית, הצומחת ביערות על גדות מפלי האיגואסו בארגנטינה באופן פראי — ללא דשנים, ללא ריסוס.
              </p>
              <p className="leading-relaxed" style={{ color: '#4A5E4D', lineHeight: 1.9, fontSize: '1.02rem' }}>
                צמח טהור כפי שהטבע יצר אותו — זו הפילוסופיה שמנחה אותנו בבחירת כל מוצר שאנו מביאים ללקוחותינו.
              </p>
            </motion.div>
            <motion.div {...fadeUp(0.15)} className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '3px solid rgba(44,84,50,0.12)' }}>
                <img src={IGUAZU_IMG} alt="מפלי האיגואסו" className="w-full object-cover" style={{ height: '440px' }} />
              </div>
              <div
                className="absolute -bottom-5 -right-5 rounded-2xl px-5 py-4 shadow-xl"
                style={{ backgroundColor: '#1E3A23', border: '1px solid rgba(200,150,62,0.3)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>מפלי האיגואסו, ארגנטינה</p>
                <p className="text-sm" style={{ color: '#C8963E', fontWeight: 700 }}>מקור הג׳רבה מאטה האורגנית שלנו</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHAT IS YERBA MATE ───────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#1E3A23' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp(0.1)} className="order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img src={MATE_LEAVES} alt="עלי ג׳רבה מאטה" className="w-full object-cover" style={{ height: '420px' }} />
              </div>
            </motion.div>
            <motion.div {...fadeUp()} className="text-right order-1 lg:order-2">
              <p className="mb-4 text-sm" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>הצמח</p>
              <h2
                className="text-white mb-6"
                style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 400, lineHeight: 1.25 }}
              >
                מהי ג׳רבה מאטה?
              </h2>
              <p className="leading-relaxed mb-5" style={{ color: '#9DB89F', lineHeight: 1.9 }}>
                ג׳רבה מאטה (Ilex paraguariensis) היא צמח ירוק עד הגדל ביערות הגשם של דרום אמריקה — בעיקר בארגנטינה, פאראגואי ואורוגואי. עליו מייבשים ומועכים כדי להכין את משקה המאטה המסורתי.
              </p>
              <p className="leading-relaxed mb-7" style={{ color: '#9DB89F', lineHeight: 1.9 }}>
                הצמח נחשב לאחד מהצמחים העשירים ביותר בנוגדי חמצון, ויטמינים ומינרלים. שתיית מאטה היא מסורת בת מאות שנים אצל עמי גוארני, ועם השנים הפכה לפנומן בריאותי עולמי.
              </p>
              <div
                className="rounded-2xl px-5 py-4"
                style={{ backgroundColor: 'rgba(200,150,62,0.1)', border: '1px solid rgba(200,150,62,0.25)' }}
              >
                <p style={{ color: '#C8963E', fontFamily: 'Secular One, sans-serif', fontSize: '1.05rem', fontWeight: 400 }}>
                  Ilex paraguariensis — "האשל של פאראגואי"
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  מוכר ומשווק בעולם כ-Yerba Mate
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ORIGINS ─────────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: '#EEF5EE' }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <p className="mb-3 text-sm" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>מקורות הייבוא</p>
            <h2 style={{ fontFamily: 'Francois One, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 700, color: '#1C2B1E' }}>
              שלוש מדינות, איכות אחת
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {origins.map((o, i) => (
              <motion.div
                key={o.country}
                {...fadeUp(i * 0.1)}
                className="rounded-2xl p-6 text-right"
                style={{ backgroundColor: '#ffffff', border: '1px solid rgba(44,84,50,0.1)' }}
              >
                <span className="text-4xl mb-3 block">{o.flag}</span>
                <h3 className="mb-2" style={{ fontFamily: 'Secular One, sans-serif', color: '#1C2B1E', fontSize: '1.15rem', fontWeight: 400 }}>
                  {o.country}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#5A7260' }}>{o.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATE BENEFITS ────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp()} className="text-right">
              <p className="mb-4 text-sm" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>למה ג׳רבה מאטה?</p>
              <h2
                style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 400, color: '#1C2B1E', lineHeight: 1.25 }}
                className="mb-8"
              >
                יתרונות הצמח<br />
                <span style={{ color: '#2C5432' }}>שכובש את העולם</span>
              </h2>
              <div className="grid gap-4">
                {mateBenefits.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <motion.div
                      key={b.title}
                      {...fadeUp(i * 0.07)}
                      className="flex items-start gap-4 rounded-2xl p-4 text-right"
                      style={{ backgroundColor: '#F8F3EB', border: '1px solid rgba(44,84,50,0.07)' }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF5EE' }}>
                        <Icon size={18} style={{ color: '#2C5432' }} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Secular One, sans-serif', color: '#1C2B1E', fontSize: '1rem', fontWeight: 400, marginBottom: '2px' }}>
                          {b.title}
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#5A7260' }}>{b.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.15)}>
              <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '2px solid rgba(44,84,50,0.1)' }}>
                <img src={MATE_GOURD} alt="כוס ג׳רבה מאטה מסורתית" className="w-full object-cover" style={{ height: '620px' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── QUALITY COMMITMENT ───────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#1E3A23' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <p className="mb-3 text-sm" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>המחויבות שלנו</p>
            <h2
              className="text-white"
              style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 400 }}
            >
              ג׳רבה מאטה שאפשר לסמוך עליה
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Leaf, text: '100% טבעי ואורגני, ללא תוספות כימיות' },
              { icon: Star, text: 'עומד בכל תקני תוספי התזונה והמזון' },
              { icon: Leaf, text: 'גידול פראי ללא דשנים וחומרי הדברה' },
              { icon: Star, text: 'ייבוא ישיר ממקורות מובחרים בדרום אמריקה' },
              { icon: Leaf, text: 'אורגני, טבעוני וללא גלוטן' },
              { icon: Star, text: 'נבחר ונבדק בקפידה לפני הגעה ללקוח' },
            ].map((cert, i) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.07)}
                  className="flex items-center gap-3 rounded-2xl px-5 py-4 text-right"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(200,150,62,0.15)' }}>
                    <Icon size={16} style={{ color: '#C8963E' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{cert.text}</p>
                </motion.div>
              );
            })}
          </div>
          <motion.div {...fadeUp(0.3)} className="text-center mt-16">
            <p
              className="text-white"
              style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, lineHeight: 1.4 }}
            >
              הרבלוק:{' '}
              <span style={{ color: '#C8963E' }}>טבעי להתמזג עם הטבע</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#F8F3EB' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <motion.div {...fadeUp()}>
            <h2
              className="mb-5"
              style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 400, color: '#1C2B1E' }}
            >
              רוצים להצטרף למשפחת Herbalook?
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: '#5A7260' }}>
              אנו מחפשים שותפים קמעונאיים ומשווקים שמאמינים בטבע ובאיכות כמונו.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                onClick={onNavigateHome}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm"
                style={{ backgroundColor: '#1E3A23', color: '#ffffff', border: 'none', cursor: 'pointer' }}
              >
                <ChevronLeft size={16} />
                לקטלוג המוצרים
              </motion.button>
              <a
                href="tel:0523834722"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm"
                style={{ backgroundColor: '#C8963E', color: '#ffffff' }}
              >
                052-3834722
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
