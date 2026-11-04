import type { Metadata } from "next";
import Link from "next/link";
import { ChartNoAxesCombined } from "lucide-react";
import "./globals.css";
import StructuredData from "../components/StructuredData";
import { author, socialImage } from "../lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default:
      "Simulador de amortização imobiliária Price e SAC | Simular Amortização",
    template: "%s | Simular Amortização",
  },
  description:
    "Simule amortizações do financiamento imobiliário com Price, SAC e FGTS. Compare redução de prazo ou parcela, juros e previsão de quitação. Grátis, sem cadastro.",
  robots: { index: true, follow: true },
  verification: {
    google: "uBEIJW2KYQttod65EVXozyMP7omfvNlWHeFFhbn-MjU",
  },
  authors: [{ name: author.name }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Simular Amortização",
    title: "Simulador de amortização imobiliária Price e SAC",
    description:
      "Descubra quanto tempo e juros você pode economizar com amortizações e FGTS.",
    images: [socialImage],
    ...(siteUrl ? { url: `${siteUrl.replace(/\/$/, "")}/` } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulador de amortização imobiliária Price e SAC",
    description:
      "Compare amortizações, prazo, parcelas e juros com Price, SAC e FGTS.",
    images: [socialImage.url],
  },
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6063009392397165"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {siteUrl && (
          <StructuredData
            data={{
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Simular Amortização",
              url: `${siteUrl.replace(/\/$/, "")}/`,
              inLanguage: "pt-BR",
              publisher: author,
            }}
          />
        )}
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link
              href="/"
              className="brand"
              aria-label="Simular Amortização — início"
            >
              <span className="brand-icon">
                <ChartNoAxesCombined size={24} />
              </span>
              <span>
                Simular <span className="brand-light">Amortização</span>
              </span>
            </Link>
            <nav aria-label="Principal">
              <Link href="/#simulador">Simulador</Link>
              <Link href="/#como-funciona">Como funciona</Link>
              <Link href="/metodologia/">Metodologia</Link>
            </nav>
            <span className="header-tag">
              <i />
              Grátis e sem cadastro
            </span>
          </div>
        </header>
        <main id="conteudo">{children}</main>
        <footer className="site-footer">
          <div className="container footer-main">
            <div>
              <Link href="/" className="brand">
                <span className="brand-icon">
                  <ChartNoAxesCombined size={20} />
                </span>
                <span>
                  Simular <span className="brand-light">Amortização</span>
                </span>
              </Link>
              <p>Mais clareza para planejar a conquista da sua casa.</p>
            </div>
            <nav aria-label="Rodapé">
              <Link href="/sobre/">Sobre</Link>
              <Link href="/metodologia/">Metodologia e fontes</Link>
              <Link href="/privacidade/">Privacidade</Link>
              <Link href="/termos/">Termos de uso</Link>
            </nav>
          </div>
          <div className="container footer-bottom">
            <span>
              Ferramenta independente. Sem vínculo com instituições financeiras.
            </span>
            <span>Seus cálculos ficam no navegador.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
