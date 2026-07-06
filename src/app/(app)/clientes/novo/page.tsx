import { requireUser } from "@/lib/session";
import { criarCliente } from "@/lib/actions/clientes";
import { input, label, btnPrimary, btnSecondary, card } from "@/lib/ui";
import Link from "next/link";

export default async function NovoClientePage() {
  await requireUser();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">
        Novo Cliente
      </h1>
      <form action={criarCliente} className={`${card} p-6 space-y-4`}>
        <div>
          <label htmlFor="nome" className={label}>
            Nome *
          </label>
          <input id="nome" name="nome" required className={input} />
        </div>
        <div>
          <label htmlFor="telefone" className={label}>
            Telefone
          </label>
          <input id="telefone" name="telefone" className={input} />
        </div>
        <div>
          <label htmlFor="email" className={label}>
            E-mail
          </label>
          <input id="email" name="email" type="email" className={input} />
        </div>
        <div>
          <label htmlFor="endereco" className={label}>
            Endereço
          </label>
          <input id="endereco" name="endereco" className={input} />
        </div>
        <div>
          <label htmlFor="observacoes" className={label}>
            Observações
          </label>
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            className={input}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Salvar
          </button>
          <Link href="/clientes" className={btnSecondary}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
