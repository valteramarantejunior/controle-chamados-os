import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { signIn } from "@/auth";
import { input, label } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        senha: formData.get("senha"),
        redirectTo: "/",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw err;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-8 border border-slate-200">
        <Image
          src="/logo.png"
          alt="JD Segurança e Tecnologia"
          width={220}
          height={55}
          className="w-full h-auto mb-4"
          priority
        />
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Controle de Chamados e OS
        </h1>
        <p className="text-sm text-slate-500 mb-6">Entre com sua conta</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            E-mail ou senha inválidos.
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="email" className={label}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={input}
            />
          </div>
          <div>
            <label htmlFor="senha" className={label}>
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              required
              className={input}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
