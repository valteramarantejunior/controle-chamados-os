import type { Papel } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: Papel;
  }

  interface Session {
    user: {
      id: string;
      role: Papel;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Papel;
  }
}
