import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "P23 Marketing Engine",
    short_name: "P23 Marketing",
    description:
      "Lead capture, multi-channel attribution, and intelligent lead management.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait",
    background_color: "#143028",
    theme_color: "#143028",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open marketing dashboard",
        url: "/dashboard",
      },
      {
        name: "CRM Leads",
        short_name: "CRM",
        description: "Open CRM leads",
        url: "/crm/leads",
      },
    ],
    categories: ["business", "productivity"],
    prefer_related_applications: false,
  };
}
