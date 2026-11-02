import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container prose">
      <div className="eyebrow">Página não encontrada</div>
      <h1>Vamos voltar ao seu planejamento?</h1>
      <p>O endereço pode ter mudado ou não existir.</p>
      <Link className="cta-link" href="/">
        Ir para o simulador
      </Link>
    </div>
  );
}
