import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Álbum Copa 2026",
    short_name: "Copa 2026",
    description: "Controle das minhas figurinhas da Copa do Mundo 2026",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f3ec",
    theme_color: "#9bdcc0",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
