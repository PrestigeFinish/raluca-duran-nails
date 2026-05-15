import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Raluca Beauty",
    short_name: "Raluca Beauty",
    description: "Programări nails și make-up by Raluca Duran",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf4ee",
    theme_color: "#b7836e",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
