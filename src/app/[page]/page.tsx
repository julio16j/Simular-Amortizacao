import type { Metadata } from "next";
import Link from "next/link";
import { informationPages } from "../../lib/content";
type Key = keyof typeof informationPages;
export function generateStaticParams() {
  return Object.keys(informationPages).map((page) => ({ page }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: Key }>;
}): Promise<Metadata> {
  const { page } = await params,
    content = informationPages[page];
  return {
    title: content.title,
    description: content.description,
    alternates: process.env.NEXT_PUBLIC_SITE_URL
      ? { canonical: `/${page}/` }
      : undefined,
  };
}
export default async function InformationPage({
  params,
}: {
  params: Promise<{ page: Key }>;
}) {
  const { page } = await params,
    content = informationPages[page];
  return (
    <article className="container prose">
      <Link className="back" href="/">
        ← Voltar ao simulador
      </Link>
      <h1>{content.title}</h1>
      {content.body}
      <Link className="cta-link" href="/#simulador">
        Simular meu financiamento →
      </Link>
    </article>
  );
}
