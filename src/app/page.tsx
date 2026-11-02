import Simulator from "../components/Simulator";
import EducationalContent from "../components/EducationalContent";
import StructuredData from "../components/StructuredData";
import { siteName, siteUrl } from "../lib/seo";
export default function Home() {
  return (
    <div className="container">
      {siteUrl && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: siteName,
            url: `${siteUrl}/`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            inLanguage: "pt-BR",
            isAccessibleForFree: true,
            description:
              "Simulador de amortização imobiliária com Price, SAC e FGTS.",
          }}
        />
      )}
      <section className="intro">
        <div>
          <div className="eyebrow">
            <i /> Planeje seu próximo passo
          </div>
          <h1>
            Simulador de <em>amortização imobiliária</em>
          </h1>
          <p>
            Seu imóvel, quitado mais cedo. Compare Price, SAC e FGTS e descubra
            quanto tempo e juros você pode economizar no seu financiamento.
          </p>
        </div>
      </section>
      <Simulator />
      <EducationalContent />
    </div>
  );
}
