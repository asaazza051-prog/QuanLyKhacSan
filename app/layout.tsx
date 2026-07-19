import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Lumière Hotel — Khách Sạn Boutique Sang Trọng",
    template: "%s — Lumière Hotel",
  },
  description:
    "Trải nghiệm không gian nghỉ dưỡng tinh tế, sang trọng và dịch vụ cá nhân hóa đỉnh cao tại trung tâm thành phố. Đặt phòng ngay để nhận ưu đãi tốt nhất.",
  keywords: [
    "khách sạn boutique",
    "Lumière Hotel",
    "đặt phòng khách sạn",
    "khách sạn sang trọng",
    "nghỉ dưỡng cao cấp",
  ],
  authors: [{ name: "Lumière Hotel" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Lumière Hotel",
    title: "Lumière Hotel — Khách Sạn Boutique Sang Trọng",
    description:
      "Trải nghiệm không gian nghỉ dưỡng tinh tế tại Lumière Hotel. Đặt phòng ngay.",
    images: [
      {
        url: "/images/hero-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Lumière Hotel - Khách sạn boutique sang trọng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumière Hotel — Khách Sạn Boutique Sang Trọng",
    description: "Trải nghiệm không gian nghỉ dưỡng tinh tế tại Lumière Hotel.",
    images: ["/images/hero-bg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
