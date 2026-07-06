"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const PAPEL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  ATENDENTE: "Atendente",
  TECNICO: "Técnico",
};

export function AppSidebar({
  userName,
  userRole,
  navItems,
  logoutAction,
}: {
  userName: string;
  userRole: string;
  navItems: { href: string; label: string }[];
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between bg-slate-900 text-slate-100 px-4 py-3">
        <span className="font-semibold text-sm">Controle de Chamados</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="rounded-md p-2 hover:bg-slate-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="bg-white rounded-md px-3 py-2">
            <Image
              src="/logo.png"
              alt="JD Segurança e Tecnologia"
              width={160}
              height={40}
              className="w-full h-auto"
              priority
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Controle de Chamados e OS
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <p className="px-3 text-sm font-medium truncate">{userName}</p>
          <p className="px-3 text-xs text-slate-400 mb-2">
            {PAPEL_LABEL[userRole] ?? userRole}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
