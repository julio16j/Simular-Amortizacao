import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "../../../lib/content";
import { disclaimer } from "../../../components/EducationalContent";
type Key = keyof typeof articles;
export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: Key }>;
}): Promise<Metadata> {
  const { slug } = await params,
    article = articles[slug];
  return {
    title: article.title,
    description: article.description,
    alternates: process.env.NEXT_PUBLIC_SITE_URL
      ? { canonical: `/guias/${slug}/` }
      : undefined,
  };
}
export default async function Guide({
  params,
}: {
  params: Promise<{ slug: Key }>;
}) {
  const { slug } = await params,
    article = articles[slug];
  return (
    <article className="container prose">
      <Link className="back" href="/">
        ← Voltar ao simulador
      </Link>
      <h1>{article.title}</h1>
      <p className="helper">Conteúdo educativo · revisão em 02/11/2026</p>
      {article.body}
      <Link className="cta-link" href="/#simulador">
        Experimentar no simulador →
      </Link>
      <p className="disclaimer">{disclaimer}</p>
    </article>
  );
}
