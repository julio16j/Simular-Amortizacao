import type { Metadata } from "next";

export const siteName = "Simular Amortização";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
export const author = {
  "@type": "Person",
  name: "Julio Cesar Urbano",
  ...(siteUrl ? { url: `${siteUrl}/sobre/` } : {}),
};
export const socialImage = {
  url: `${siteUrl || process.env.NEXT_PUBLIC_BASE_PATH || ""}/social-card.png`,
  width: 1200,
  height: 630,
  alt: "Simular Amortização — simulador imobiliário Price, SAC e FGTS",
};

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  article = false,
): Metadata {
  return {
    title,
    description,
    ...(siteUrl ? { alternates: { canonical: `${siteUrl}${path}` } } : {}),
    openGraph: {
      type: article ? "article" : "website",
      locale: "pt_BR",
      siteName,
      title,
      description,
      ...(siteUrl ? { url: `${siteUrl}${path}` } : {}),
      images: [socialImage],
      ...(article ? { authors: [author.name] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
