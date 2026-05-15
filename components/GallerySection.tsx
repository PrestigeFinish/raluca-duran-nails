"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GallerySection({ category }: { category: "nails" | "makeup" }) {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    async function loadPhotos() {
      const { data } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      setPhotos(data || []);
    }

    loadPhotos();
  }, [category]);

  if (photos.length === 0) {
    return (
      <p className="section-lead">
        Galeria va fi actualizată în curând cu lucrări reale.
      </p>
    );
  }

  return (
    <div className="gallery-grid">
      {photos.map((photo) => (
        <img
          key={photo.id}
          className="gallery-item"
          src={photo.image_url}
          alt={photo.title || "Raluca Duran Beauty"}
        />
      ))}
    </div>
  );
}
