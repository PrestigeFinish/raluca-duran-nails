import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raluca Beauty",
    short_name: "Raluca Beauty",
    description: "Raluca Duran Nails & Beauty",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf4ee",
    theme_color: "#b98472",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
