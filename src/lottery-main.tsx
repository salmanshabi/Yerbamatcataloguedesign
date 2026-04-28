import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import LotteryPage from './app/components/lottery/LotteryPage';
import './styles/index.css';

createRoot(document.getElementById('lottery-root')!).render(
  <>
    <LotteryPage />
    <Analytics />
    <SpeedInsights />
  </>
);
