import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://herbalookcatalogue.figma.site';
const SITE_NAME = 'Herbalook';

// JSON-LD structured data for the business
const businessSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Herbalook',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'ייבוא ושיווק ג׳רבה מאטה אורגנית לעסקים — קמעונאים ומשווקים. פעילים מאז 1994.',
  foundingDate: '1994',
  telephone: '+972-52-3834722',
  email: 'salmanshaby@gmail.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IL',
  },
  sameAs: [SITE_URL],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+972-52-3834722',
    contactType: 'sales',
    availableLanguage: ['Hebrew', 'Arabic'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'קטלוג B2B לג׳רבה מאטה אורגנית — סיטונאות לקמעונאים ומשווקים',
  inLanguage: 'he',
};

// Combine both schemas into one array for home page
const homeSchemas = JSON.stringify([businessSchema, websiteSchema]);
const aboutSchemas = JSON.stringify([businessSchema]);

const OG_IMAGE = 'https://images.unsplash.com/photo-1648485716909-2636f8abb2cd?w=1200&h=630&fit=crop&q=80';

interface SEOHeadProps {
  page?: 'home' | 'about';
}

export function SEOHead({ page = 'home' }: SEOHeadProps) {
  const isHome = page === 'home';

  const title = isHome
    ? 'Herbalook | קטלוג ג׳רבה מאטה אורגנית לעסקים'
    : 'אודות Herbalook | ג׳רבה מאטה אורגנית מאז 1994';

  const description = isHome
    ? 'Herbalook — ייבוא ושיווק ג׳רבה מאטה אורגנית פרמיום לקמעונאים ומשווקים. מגוון מוצרים, סטים וכלים. הצעת מחיר מותאמת | 052-3834722 | herbalook.online'
    : 'הכירו את Herbalook — חברה המתמחה בייבוא ושיווק ג׳רבה מאטה אורגנית מדרום אמריקה מאז 1994. מקורות מובחרים מארגנטינה, פאראגואי ואורוגואי.';

  const canonical = isHome ? SITE_URL : `${SITE_URL}/about`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Herbalook" />
      <meta
        name="keywords"
        content="ג׳רבה מאטה, yerba mate, מאטה אורגני, קטלוג סיטונות, Herbalook, מאטה לעסק��ם, ייבוא מאטה, מאטה ישראל, מאטה אורגנית, herbalook.online"
      />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content="he_IL" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Herbalook — ג׳רבה מאטה אורגנית" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {/* JSON-LD — single script, no conditional children */}
      <script type="application/ld+json">
        {isHome ? homeSchemas : aboutSchemas}
      </script>
    </Helmet>
  );
}