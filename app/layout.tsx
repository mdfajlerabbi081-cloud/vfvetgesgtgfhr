import type { Metadata } from 'next';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'TRENDVERSE - প্রিমিয়াম ফ্যাশন ও থ্রি-পিস শপ',
  description:
    'TRENDVERSE-এর অফিশিয়াল ই-কমার্স সাইট। দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা থেকে সেরা মানের ওভারসাইজ টি-শার্ট ও থ্রি-পিস অর্ডার করুন।',
  openGraph: {
    type: 'website',
    siteName: 'TRENDVERSE',
    locale: 'bn_BD',
    title: 'TRENDVERSE - প্রিমিয়াম ফ্যাশন ও থ্রি-পিস শপ',
    description:
      'TRENDVERSE-এর অফিশিয়াল ই-কমার্স সাইট। দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা থেকে সেরা মানের ওভারসাইজ টি-শার্ট ও থ্রি-পিস অর্ডার করুন।',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TRENDVERSE - প্রিমিয়াম ফ্যাশন ও থ্রি-পিস শপ',
    description:
      'TRENDVERSE-এর অফিশিয়াল ই-কমার্স সাইট। দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা থেকে সেরা মানের ওভারসাইজ টি-শার্ট ও থ্রি-পিস অর্ডার করুন।',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
