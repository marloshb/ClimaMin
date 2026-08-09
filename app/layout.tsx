import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./emergency.css";
import "./environment.css";
import "./chain-v2.css";
import "./platform-ops.css";
import "./risk.css";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#081923",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "ATLAS CLIMA | Gêmeo Digital de Tubarão",
    description: "Plataforma geoespacial de missão crítica para antecipar eventos climáticos, modelar impactos e orquestrar decisões operacionais em tempo real.",
    applicationName: "ATLAS CLIMA",
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: origin,
      siteName: "ATLAS CLIMA",
      title: "Gêmeo Digital de Tubarão — do clima à decisão",
      description: "GIS, modelos e agentes de IA para observar, antecipar, decidir, despachar, recuperar e aprender.",
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "ATLAS CLIMA — Gêmeo Digital de Tubarão" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "ATLAS CLIMA | Gêmeo Digital de Tubarão",
      description: "Do clima à decisão operacional, com contexto geoespacial e rastreabilidade.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://js.arcgis.com" />
        <link rel="preconnect" href="https://www.arcgis.com" />
        <script type="module" src="https://js.arcgis.com/5.1/" />
      </head>
      <body>{children}</body>
    </html>
  );
}
