import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Fotos de câmera de celular costumam ter vários MB; o padrão do
      // Next.js (1MB) é pequeno demais e fazia o envio falhar sem aviso.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
