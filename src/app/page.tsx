import Simulator from "../components/Simulator";
import EducationalContent from "../components/EducationalContent";
export default function Home() {
  return (
    <div className="container">
      <section className="intro">
        <div>
          <div className="eyebrow">
            <i /> Planeje seu próximo passo
          </div>
          <h1>
            Seu imóvel, <em>quitado mais cedo.</em>
          </h1>
          <p>
            Simulador de amortização imobiliária: descubra quanto tempo e juros
            você pode economizar no seu financiamento.
          </p>
        </div>
      </section>
      <Simulator />
      <EducationalContent />
    </div>
  );
}
