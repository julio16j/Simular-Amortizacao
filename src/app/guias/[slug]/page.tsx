import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "../../../lib/content";
import { disclaimer } from "../../../components/EducationalContent";
import StructuredData from "../../../components/StructuredData";
import { author, pageMetadata, siteUrl, socialImage } from "../../../lib/seo";
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
  return pageMetadata(
    article.title,
    article.description,
    `/guias/${slug}/`,
    true,
  );
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
      {siteUrl && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: article.title,
                description: article.description,
                mainEntityOfPage: `${siteUrl}/guias/${slug}/`,
                inLanguage: "pt-BR",
                author,
                image: socialImage.url,
                dateModified: "2026-11-02",
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Simulador",
                    item: `${siteUrl}/`,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: article.title,
                    item: `${siteUrl}/guias/${slug}/`,
                  },
                ],
              },
            ],
          }}
        />
      )}
      <Link className="back" href="/">
        ← Voltar ao simulador
      </Link>
      <h1>{article.title}</h1>
      <p className="helper">
        Por <Link href="/sobre/">Julio Cesar Urbano</Link> · Conteúdo educativo
        · Atualizado em <time dateTime="2026-11-02">02/11/2026</time>
      </p>
      {article.body}
      <Link className="cta-link" href="/#simulador">
        Experimentar no simulador →
      </Link>
      <p className="disclaimer">{disclaimer}</p>
    </article>
  );
}
