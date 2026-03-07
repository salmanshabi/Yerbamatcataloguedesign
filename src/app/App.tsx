import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { HelmetProvider } from 'react-helmet-async';
import { products } from './data/products';
import type { ProductCategory } from './data/products';
import { ProductCard } from './components/ProductCard';
import { PartnerReason } from './components/PartnerReason';
import { BenefitCard } from './components/BenefitCard';
import { AnimatedSection } from './components/AnimatedSection';
import { SEOHead } from './components/SEOHead';
const AboutPage = React.lazy(() => import('./components/AboutPage').then(module => ({ default: module.AboutPage })));
import {
  Leaf, Heart, Zap, Shield, Menu, Mail, Globe, X,
  TrendingUp, Package, Users, Award, ArrowLeft, ChevronDown, CheckCircle,
} from 'lucide-react';
const logo = '/images/13dc8d557d8360ccddfce8eb7118c03ba57a9655.png';

// ── Polyfill ──────────────────────────────────────────────────────────────────
if (typeof Node !== 'undefined' && !(Node.prototype as any).closest) {
  (Node.prototype as any).closest = function (selector: string) {
    let el: Node | null = this;
    while (el && el.nodeType !== 1) el = el.parentNode;
    return el ? (el as Element).closest(selector) : null;
  };
}

const FARM_IMAGE = 'https://images.unsplash.com/photo-1662628325105-abdc437c2903?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080';
const AERIAL_IMAGE = 'https://images.unsplash.com/photo-1648485716909-2636f8abb2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080';

// Google Sheets Apps Script
// Sheet ID: 16QU-r7HkT_gZRvCnu4dbLQ_88YyciUW1fPlzjI64iPE
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyL9juC4EiZk8Q-Cu6bdEnrx94XCSy7mEceVpwO3OquWDjDoPvlEqQJpKHhLTzEDCk7/exec';

type CategoryFilter = 'All' | ProductCategory;
type Page = 'home' | 'about';

const benefits = [
  { icon: Zap, title: 'אנרגיה טבעית מתמשכת', description: 'קפאין מאוזן בשילוב יאוברומין מספק אנרגיה חלקה ומתמשכת ללא נפילות או עצבנות.' },
  { icon: Heart, title: 'בריאות הלב', description: 'עשיררקדי חמצון ופוליפנולים התומכים בבריאות הלב ורמות כולסטרול תקינות.' },
  { icon: Shield, title: 'חיזוק מערכת החיסון', description: 'עשיר בוויטמינים C ו-E ומינרלים חיוניים לחיזוק המערכת החיסונית באופן טבעי.' },
  { icon: Leaf, title: '100% טבעי וטהור', description: 'ללא תוספים, ללא טעמים מלאכותיים. רק ג׳רבה מאטה פרמיום כפי שהטבע יצר.' },
];

const partnerReasons = [
  { icon: TrendingUp, title: 'שוק בצמיחה — היכנסו לפני כולם', description: 'ג׳רבה מאטה היא אחד המשקאות הפונקציונליים הצמחים ביותר בעולם. הצרכנים כבר מחפשים — תנו להם את זה על המדף שלכם.' },
  { icon: Package, title: 'גמישות שמתאימה לכל עסק', description: 'בין אם אתם חנות בוטיק או רשת הפצה — יש לנו את הפורמט הנכון. מגוון אריזות ונפחים, ללא התחייבות למינימום שאינו מתאים לכם.' },
  { icon: Users, title: 'אנחנו איתכם גם אחרי ההזמנה', description: 'תקבלו מנהל חשבון אישי, חומרי שיווק מוכנים לשימוש ואימון צוות — כי הצלחה שלכם היא גם הצלחתנו.' },
  { icon: Award, title: 'איכות שאפשר להוכיח ללקוח', description: 'כל מנה עוברת בדיקות מעבדה ומלווה בתיעוד מלא ממקור הגידול ועד האריזה. שקיפות מלאה — בדיוק מה שהלקוח של היום דורש.' },
  { icon: Leaf, title: 'מותג עם סיפור שמוכר את עצמו', description: 'אורגני, Fair Trade, משקים משפחתיים מדרום אמריקה — לקוחות מתחברים לנרטיב הזה ומחזירים אותו אליכם בקניות חוזרות.' },
];

const stats = [
  { value: '+25', label: 'שנות ניסיון' },
  { value: '+500', label: 'שותפי קמעונאות' },
];

const footerCategories: { label: string; category: CategoryFilter }[] = [
  { label: 'ג׳רבה מאטה', category: 'YerbaMate' },
  { label: 'סטים', category: 'Sets' },
  { label: 'כלים לשתייה', category: 'Accessories' },
  { label: 'סבוני מאטה', category: 'Soaps' },
];

export default function App() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('YerbaMate');
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Nav
  const [navVisible, setNavVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const lastScrollRef = useRef(0);

  // Form
  const [formData, setFormData] = useState({ company: '', name: '', email: '', phone: '', type: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  // ── Motion ────────────────────────────────────────────────────────────────
  const reduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 500], [0, reduced ? 0 : 8]);

  // ── Scroll direction → navbar hide/show ──────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 20);
      setNavVisible(y <= lastScrollRef.current || y < 80);
      lastScrollRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Active section tracking ───────────────────────────────────────────────
  useEffect(() => {
    const ids = ['products', 'benefits', 'partner', 'contact'];
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -40% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // ── Filtered products ─────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => p.category === activeCategory && !p.id.startsWith('dup-'));
    if (activeCategory === 'YerbaMate') {
      return filtered.flatMap((p) => {
        if (p.weights && p.weights.length > 1) {
          return p.weights.map((w) => ({
            ...p,
            id: `${p.id}-${w}`,
            weight: w,
            weights: [w],
            sku: `${p.sku}-${w.replace(/\s/g, '')}`,
          }));
        }
        return [p];
      });
    }
    return filtered;
  }, [activeCategory]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToCategory = (category: CategoryFilter) => {
    setCurrentPage('home');
    setActiveCategory(category);
    setTimeout(() => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const goToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goToAbout = () => {
    setMobileMenuOpen(false);
    setCurrentPage('about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Form submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError('');
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, timestamp: new Date().toISOString() }),
      });
      setSubmitted(true);
    } catch {
      setSendError('שגיאה בשליחה. נסו שוב או צרו קשר ישירות.');
    } finally {
      setSending(false);
    }
  };

  const navLinks = [
    { id: 'products', label: 'מוצרים' },
    { id: 'benefits', label: 'יתרונות' },
    { id: 'partner', label: 'שותפות עסקית' },
    { id: 'contact', label: 'צור קשר' },
  ];

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#F8F3EB',
    border: '1px solid rgba(44,84,50,0.15)',
    color: '#1C2B1E',
  };

  return (
    <HelmetProvider>
      <div dir="rtl" lang="he" className="min-h-screen" style={{ backgroundColor: '#F8F3EB', fontFamily: 'Assistant, sans-serif' }}>

        <SEOHead page={currentPage} />

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <motion.header
          animate={{ y: navVisible ? 0 : -80, opacity: navVisible ? 1 : 0 }}
          transition={{ duration: reduced ? 0.1 : 0.28, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-50 border-b"
          style={{
            backgroundColor: atTop ? '#1E3A23' : 'rgba(28,43,30,0.97)',
            borderColor: 'rgba(255,255,255,0.08)',
            backdropFilter: atTop ? 'none' : 'blur(12px)',
          }}
        >
          <nav className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={goHome}
                className="flex items-center gap-2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <img src={logo} alt="Herbalook" className="h-10 brightness-0 invert" fetchPriority="high" loading="eager" />
              </button>

              {/* Desktop links */}
              <div className="hidden md:flex items-center gap-8 flex-row-reverse">
                {/* About link */}
                <button
                  onClick={goToAbout}
                  className="relative text-sm tracking-wide transition-colors duration-200 py-1"
                  style={{ color: currentPage === 'about' ? '#C8963E' : 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { if (currentPage !== 'about') e.currentTarget.style.color = '#C8963E'; }}
                  onMouseLeave={(e) => { if (currentPage !== 'about') e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                >
                  אודות
                  <span
                    className="absolute bottom-0 right-0 h-px bg-[#C8963E] transition-all duration-300"
                    style={{ width: currentPage === 'about' ? '100%' : '0%' }}
                  />
                </button>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => link.id === 'products' ? goToCategory('YerbaMate') : goToSection(link.id)}
                    className="relative text-sm tracking-wide transition-colors duration-200 py-1"
                    style={{ color: (currentPage === 'home' && activeSection === link.id) ? '#C8963E' : 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { if (activeSection !== link.id) e.currentTarget.style.color = '#C8963E'; }}
                    onMouseLeave={(e) => { if (activeSection !== link.id) e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
                  >
                    {link.label}
                    {/* RTL sliding underline indicator */}
                    <span
                      className="absolute bottom-0 right-0 h-px bg-[#C8963E] transition-all duration-300"
                      style={{ width: (currentPage === 'home' && activeSection === link.id) ? '100%' : '0%' }}
                    />
                  </button>
                ))}
                <motion.a
                  href="#contact"
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  whileHover={reduced ? {} : { y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm px-5 py-2.5 rounded-xl transition-opacity duration-200 hover:opacity-90 inline-block"
                  style={{ backgroundColor: '#C8963E', color: '#ffffff' }}
                  onClick={(e) => { if (currentPage !== 'home') { e.preventDefault(); goToSection('contact'); } }}
                >
                  הצטרפו כשותפים
                </motion.a>
              </div>

              {/* Mobile toggle */}
              <motion.button
                whileTap={reduced ? {} : { scale: 0.95 }}
                className="md:hidden p-2 rounded-lg"
                style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="md:hidden pt-4 pb-3 mt-3 border-t flex flex-col gap-3 text-right"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <button
                    onClick={goToAbout}
                    className="text-sm py-2 text-right transition-colors"
                    style={{ color: currentPage === 'about' ? '#C8963E' : 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    אודות
                  </button>
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => link.id === 'products' ? goToCategory('YerbaMate') : goToSection(link.id)}
                      className="text-sm py-2 text-right transition-colors"
                      style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {link.label}
                    </button>
                  ))}
                  <a
                    href="#contact"
                    className="text-sm text-center px-5 py-2.5 rounded-xl mt-1"
                    style={{ backgroundColor: '#C8963E', color: '#ffffff' }}
                    onClick={() => { setMobileMenuOpen(false); if (currentPage !== 'home') { setCurrentPage('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 120); } }}
                  >
                    הצטרפו כשותפים
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </motion.header>

        {/* Spacer for fixed header */}
        <div style={{ height: 73 }} />

        {/* ── PAGE SWITCHER ───────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {currentPage === 'about' ? (
            <motion.div
              key="about"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#2C5432]">Loading...</div>}>
                <AboutPage onNavigateHome={goHome} />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="home"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >

              {/* ── HERO ───────────────────────────────────────────────────────────── */}
              <section ref={heroRef} className="relative overflow-hidden" style={{ minHeight: '88vh' }}>
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img
                    src={AERIAL_IMAGE}
                    alt="שדות Herbalook"
                    style={{ y: heroParallaxY, height: 'calc(100% + 20px)', top: '-10px' }}
                    className="absolute inset-x-0 w-full object-cover"
                    fetchPriority="high"
                    loading="eager"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(30,58,35,0.92) 0%, rgba(44,84,50,0.78) 50%, rgba(30,58,35,0.55) 100%)' }}
                  />
                </div>

                <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-12 pb-28 md:pt-16 md:pb-40">
                  <motion.div
                    initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex justify-center mb-10"
                  >
                    <img src={logo} alt="Herbalook" className="h-16 md:h-20 brightness-0 invert" fetchPriority="high" loading="eager" />
                  </motion.div>

                  <div className="flex justify-center">
                    <div className="text-center w-full max-w-3xl">
                      {/* Badge */}
                      <motion.div
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-[14px]"
                        style={{ backgroundColor: 'rgba(200,150,62,0.2)', color: '#C8963E', border: '1px solid rgba(200,150,62,0.35)', fontWeight: 700 }}
                      >
                        קטלוג סיטונות והצעה
                        <Leaf size={12} />
                      </motion.div>

                      {/* H1 */}
                      <motion.h1
                        initial={reduced ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.25, ease: 'easeOut' }}
                        className="mb-6 text-white"
                        style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(3rem, 6.5vw, 5rem)', fontWeight: 400, lineHeight: 1.2 }}
                      >
                        ג׳רבה מאטה<br />
                        <span style={{ color: '#C8963E' }}>לעסק שלך</span>
                      </motion.h1>

                      {/* Subtitle */}
                      <motion.p
                        initial={reduced ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                        className="text-lg mb-8 leading-relaxed mx-auto"
                        style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '600px' }}
                      >
                        שתפו פעולה עם Herbalook להציע ג׳רבה מאטה אורגנית ואותנטית ללקוחותיכם. איכות מוסמכת, הזמנות גמישות ותמיכה ייעודית לקמעונאים ומשווקים.
                      </motion.p>

                      {/* CTAs */}
                      <motion.div
                        initial={reduced ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.45, ease: 'easeOut' }}
                        className="flex flex-wrap gap-4 justify-center"
                      >
                        <motion.a
                          href="#contact"
                          whileTap={reduced ? {} : { scale: 0.97 }}
                          whileHover={reduced ? {} : { y: -2 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm"
                          style={{ backgroundColor: '#C8963E', color: '#ffffff' }}
                        >
                          <ArrowLeft size={16} />
                          הצטרפו כשותפים
                        </motion.a>
                        <motion.button
                          whileTap={reduced ? {} : { scale: 0.97 }}
                          whileHover={reduced ? {} : { y: -2 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => {
                            setActiveCategory('YerbaMate');
                            setTimeout(() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }), 80);
                          }}
                          className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm"
                          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}
                        >
                          <ChevronDown size={16} />
                          עיין במוצרים
                        </motion.button>
                      </motion.div>

                      {/* Stats */}
                      <motion.div
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="flex justify-center mt-12 pt-8"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        <div className="flex justify-between w-full max-w-sm">
                          {stats.map((s, i) => (
                            <motion.div
                              key={s.label}
                              initial={reduced ? false : { opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.65 + i * 0.12 }}
                            >
                              <p className="mb-1" style={{ fontSize: '2.8rem', fontWeight: 700, color: '#C8963E' }}>{s.value}</p>
                              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── PRODUCTS ───────────────────────────────────────────────────────── */}
              <section id="products" className="py-24" style={{ backgroundColor: '#ffffff' }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  {/* Heading */}
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="text-center mb-12"
                  >
                    <p className="mb-3 text-[15px]" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>
                      קטלוג מוצרים לעסקים
                    </p>
                    <h2 style={{ fontFamily: 'Francois One, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: '#1C2B1E' }}>
                      מגוון המוצרים שלנו
                    </h2>
                    <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: '#5A7260', lineHeight: 1.8 }}>
                      ג׳רבה מאטה פרמיום ממשקים מוסמכים בארגנטינה, ברזיל ואורוגוואי. מגוון SKU ואפשרויות אריזה להתאמה לצרכי העסק שלך.
                    </p>
                  </motion.div>

                  {/* Category filter */}
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    className="flex flex-wrap justify-center gap-2 mb-10"
                  >
                    {([
                      { key: 'YerbaMate', label: 'ג׳רבה מאטה' },
                      { key: 'Sets', label: 'סטים' },
                      { key: 'Accessories', label: 'כלים לשתייה' },
                      { key: 'Soaps', label: 'סבוני מאטה' },
                    ] as { key: CategoryFilter; label: string }[]).map(({ key, label }) => (
                      <motion.button
                        key={key}
                        whileTap={reduced ? {} : { scale: 0.97 }}
                        whileHover={reduced ? {} : { y: -1 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setActiveCategory(key)}
                        className="text-sm px-5 py-2 rounded-xl"
                        style={
                          activeCategory === key
                            ? { backgroundColor: '#2C5432', color: '#ffffff', border: 'none', cursor: 'pointer' }
                            : { backgroundColor: '#EEF5EE', color: '#2C5432', border: 'none', cursor: 'pointer' }
                        }
                      >
                        {label}
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Sets banner */}
                  <AnimatePresence>
                    {activeCategory === 'Sets' && (
                      <motion.div
                        initial={reduced ? false : { opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mb-8 rounded-2xl px-6 py-5 border"
                        style={{ backgroundColor: '#2C5432', borderColor: '#C8963E' }}
                      >
                        <p className="text-base" style={{ color: '#F8F3EB', fontWeight: 700 }}>
                          <span style={{ color: '#C8963E' }}>מגוון אפשרויות להרכבה אישית! </span>
                          ניתן לשלב ולהרכיב כמעט כל מוצר — בחרו חליטה, כוס ובמביגה לפי הטעם שלכם.
                          <span className="me-1"> צרו קשר ונשמח להתאים סט מותאם אישית עבורכם.</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Product grid with category transition */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={reduced ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? {} : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-7"
                    >
                      {filteredProducts.map((product, i) => (
                        <ProductCard key={product.id} {...product} index={i} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </section>

              {/* ── BENEFITS ───────────────────────────────────────────────────────── */}
              <AnimatedSection id="benefits" className="py-24" style={{ backgroundColor: '#F8F3EB' }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="text-center mb-14">
                    <p className="mb-3" style={{ color: '#C8963E', letterSpacing: '0.1em', fontSize: '0.85rem' }}>בריאות ורווחה</p>
                    <h2 style={{ fontFamily: 'Francois One, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: '#1C2B1E' }}>
                      למה הלקוחות שלכם יאהבו ג׳רבה מאטה?
                    </h2>
                    <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: '#5A7260', lineHeight: 1.8 }}>
                      יותר מסתם משקה — מסורת בת מאות שנים עם יתרונות בריאותיים מוכחים שהלקוחות שלכם יחזרו אליהם שוב ושוב.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {benefits.map((benefit, i) => (
                      <BenefitCard key={i} {...benefit} index={i} />
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* ── WHY PARTNER ────────────────────────────────────────────────────── */}
              <AnimatedSection id="partner" className="py-24" style={{ backgroundColor: '#1E3A23' }}>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="grid lg:grid-cols-2 gap-16 items-start">
                    <div className="text-right">
                      <p className="text-xs mb-4" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>תוכנית שותפות</p>
                      <h2
                        className="text-white mb-6"
                        style={{ fontFamily: 'Secular One, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.25 }}
                      >
                        למה קמעונאים ומשווקים בוחרים ב-Herbalook
                      </h2>
                      <p className="mb-8 leading-relaxed" style={{ color: '#9DB89F', fontSize: '0.95rem', lineHeight: 1.8 }}>
                        אנחנו לא רק מספקים מוצר. מודל השותפות שלנו בנוי כדי לעזור לעסק שלך לצמוח — מתנאי סיטונאות תחרותיים ועד תמיכה שיווקית ואימון צוות.
                      </p>
                      <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={FARM_IMAGE} alt="Herbalook" className="w-full object-cover" style={{ height: '300px' }} loading="lazy" />
                      </div>
                    </div>
                    <div className="grid gap-8" dir="rtl">
                      {partnerReasons.map((reason, i) => (
                        <PartnerReason key={i} {...reason} index={i} />
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* ── CONTACT ────────────────────────────────────────────────────────── */}
              <AnimatedSection id="contact" className="py-24" style={{ backgroundColor: '#F8F3EB' }}>
                <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="text-center mb-14">
                    <p className="mb-3 text-[16px]" style={{ color: '#C8963E', letterSpacing: '0.1em' }}>פניות מכירות</p>
                    <h2 style={{ fontFamily: 'Francois One, sans-serif', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 700, color: '#1C2B1E' }}>
                      בואו נתחיל שיחה
                    </h2>
                    <p className="mt-4 max-w-lg mx-auto text-[16px]" style={{ color: '#5A7260', lineHeight: 1.8 }}>
                      מוכנים להביא את Herbalook למדפים שלכם? מלאו את הטופס ותוכנית הסיטונאות שלנו תחזור אליכם תוך 24 שעות.
                    </p>
                  </div>

                  <div className="flex flex-col gap-8">
                    {/* Form */}
                    <div>
                      <AnimatePresence mode="wait">
                        {submitted ? (
                          <motion.div
                            key="success"
                            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-2xl p-10 text-center flex flex-col items-center justify-center"
                            style={{ backgroundColor: '#ffffff', border: '1px solid rgba(44,84,50,0.1)', minHeight: '420px' }}
                          >
                            <CheckCircle size={48} style={{ color: '#2C5432' }} className="mb-5" />
                            <h3 className="mb-3" style={{ fontFamily: 'Secular One, sans-serif', color: '#1C2B1E', fontSize: '1.4rem' }}>
                              הפנייה התקבלה!
                            </h3>
                            <p className="mb-6 text-sm" style={{ color: '#5A7260', maxWidth: '320px', lineHeight: 1.7 }}>
                              תודה שפניתם אלינו. נציג מכירות יחזור אליכם תוך 24 שעות עסקים.
                            </p>
                            <motion.button
                              whileTap={reduced ? {} : { scale: 0.97 }}
                              onClick={() => { setSubmitted(false); setFormData({ company: '', name: '', email: '', phone: '', type: '', message: '' }); }}
                              className="text-sm px-6 py-2.5 rounded-xl hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: '#EEF5EE', color: '#2C5432', border: 'none', cursor: 'pointer' }}
                            >
                              שלח פנייה נוספת
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.form
                            key="form"
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleSubmit}
                            className="rounded-2xl p-8 md:p-10 text-right"
                            style={{ backgroundColor: '#ffffff', border: '1px solid rgba(44,84,50,0.1)' }}
                          >
                            <div className="grid sm:grid-cols-2 gap-5 mb-5">
                              <div>
                                <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>שם החברה *</label>
                                <input required type="text" placeholder="שם החברה שלך"
                                  value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                  className="w-full rounded-xl px-4 py-3 text-sm outline-none text-right"
                                  style={inputStyle}
                                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2C5432')}
                                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)')}
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>שם איש הקשר *</label>
                                <input required type="text" placeholder="שמך המלא"
                                  value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="w-full rounded-xl px-4 py-3 text-sm outline-none text-right"
                                  style={inputStyle}
                                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2C5432')}
                                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)')}
                                />
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5 mb-5">
                              <div>
                                <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>דוא״ל עסקי *</label>
                                <input required type="email" placeholder="you@yourcompany.com"
                                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                  style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2C5432')}
                                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)')}
                                />
                              </div>
                              <div>
                                <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>טלפון</label>
                                <input type="tel" placeholder="050-0000000"
                                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                  style={{ ...inputStyle, direction: 'ltr', textAlign: 'left' }}
                                  onFocus={(e) => (e.currentTarget.style.borderColor = '#2C5432')}
                                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)')}
                                />
                              </div>
                            </div>

                            <div className="mb-5">
                              <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>סוג העסק *</label>
                              <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none text-right"
                                style={{ ...inputStyle, color: formData.type ? '#1C2B1E' : '#9DB89F' }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = '#2C5432')}
                                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)')}
                              >
                                <option value="" disabled>בחר את סוג עסק</option>
                                <option value="retailer">קמעונאי / חנות בריאות</option>
                                <option value="distributor">משווק / יבואן</option>
                                <option value="cafe">בית קפה / מסעדה</option>
                                <option value="ecommerce">מסחר אלקטרוני</option>
                                <option value="other">אחר</option>
                              </select>
                            </div>

                            <div className="mb-7">
                              <label className="block text-xs mb-2" style={{ color: '#5A7260' }}>הודעה / מוצרים מעניינים</label>
                              <textarea rows={4} placeholder="ספרו לנו על העסק שלכם ואיזה מוצרים מעניינים אתכם…"
                                value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none text-right"
                                style={inputStyle}
                                onFocus={(e) => (e.currentTarget.style.borderColor = '#2C5432')}
                                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(44,84,50,0.15)')}
                              />
                            </div>

                            <motion.button
                              type="submit"
                              disabled={sending}
                              whileTap={reduced ? {} : { scale: 0.97 }}
                              whileHover={reduced ? {} : { y: -2 }}
                              transition={{ duration: 0.15 }}
                              className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                              style={{ backgroundColor: '#2C5432', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                            >
                              {sending ? 'שולח…' : 'שלח פנייה'}
                              {!sending && <ArrowLeft size={16} />}
                            </motion.button>

                            {sendError && (
                              <p className="text-center text-xs mt-3" style={{ color: '#c0392b' }}>{sendError}</p>
                            )}
                            <p className="text-center text-xs mt-4" style={{ color: '#9DB89F' }}>
                              לא מוצגים מחירים בקטלוג זה. הצוות שלנו יספק הצעת מחיר מותאמת אישית.
                            </p>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Contact cards — side by side below the form */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {[
                        { label: 'טלפון ליצירת קשר', value: '052-3834722', href: 'tel:0523834722', sub: 'אנו מגיבים תוך 24 שעות עסקים', icon: Mail, ltr: true },
                        { label: 'אתר אינטרנט', value: 'www.herbalook.online', href: 'https://www.herbalook.online', sub: 'בקרו באתר הצרכנים שלנו', icon: Globe, ltr: true },
                      ].map(({ label, value, href, sub, icon: Icon, ltr }) => (
                        <motion.div
                          key={label}
                          initial={reduced ? false : { opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-40px' }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="rounded-2xl p-6 text-right"
                          style={{ backgroundColor: '#1E3A23', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 mr-auto" style={{ backgroundColor: 'rgba(200,150,62,0.15)' }}>
                            <Icon size={20} style={{ color: '#C8963E' }} />
                          </div>
                          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>{label}</p>
                          <a
                            href={href}
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="text-base text-white transition-colors duration-200 hover:text-[#C8963E]"
                            style={{ fontWeight: 500, direction: ltr ? 'ltr' : undefined, display: 'inline-block' }}
                          >
                            {value}
                          </a>
                          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
              <motion.footer
                initial={reduced ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6 }}
                className="pt-14 pb-8"
                style={{ backgroundColor: '#1C2B1E' }}
              >
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
                    {/* Brand */}
                    <div className="text-right">
                      <img src={logo} alt="Herbalook" className="h-9 brightness-0 invert mb-5 ml-auto" />
                      <p className="leading-relaxed mb-5 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        ג׳רבה מאטה המגודלת בקפידה בדרום אמריקה. מופצת ברחבי העולם לקמעונאים ומשווקים.
                      </p>
                      <a
                        href="https://www.herbalook.online"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 flex-row-reverse text-sm transition-colors duration-200 hover:opacity-80"
                        style={{ color: '#C8963E' }}
                      >
                        <Globe size={12} />
                        www.herbalook.online
                      </a>
                    </div>

                    {/* Categories */}
                    <div className="text-right">
                      <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>מוצרים</p>
                      <ul className="space-y-3">
                        {footerCategories.map(({ label, category }) => (
                          <li key={label}>
                            <motion.button
                              whileHover={reduced ? {} : { x: -4 }}
                              whileTap={reduced ? {} : { scale: 0.97 }}
                              transition={{ duration: 0.15 }}
                              onClick={() => goToCategory(category)}
                              className="text-sm transition-colors duration-200 text-right"
                              style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#C8963E')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                            >
                              {label}
                            </motion.button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Contact */}
                    <div className="text-right">
                      <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>צור קשר</p>
                      <ul className="space-y-4">
                        <li>
                          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>שעות פעילות</p>
                          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>ראשון–שישי</p>
                        </li>
                        <li>
                          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>טלפון</p>
                          <a
                            href="tel:0523834722"
                            className="text-sm transition-colors duration-200"
                            style={{ color: 'rgba(255,255,255,0.65)', direction: 'ltr', display: 'inline-block' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#C8963E')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                          >
                            052-3834722
                          </a>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <motion.a
                          href="#contact"
                          whileTap={reduced ? {} : { scale: 0.97 }}
                          whileHover={reduced ? {} : { y: -2 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#C8963E', color: '#ffffff' }}
                        >
                          בקש מידע
                          <Mail size={13} />
                        </motion.a>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div
                    className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      © 1994 Herbalook. כל הזכויות שמורות. קטלוג זה מיועד לעסקים בלבד.
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      לא מוצגים מחירי קמעונאות בקטלוג זה.
                    </p>
                  </div>
                </div>
              </motion.footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HelmetProvider>
  );
}