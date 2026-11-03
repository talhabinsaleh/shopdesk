"use client";

import { useState } from "react";

export default function ProductGallery({ name, photos }: { name: string; photos: string[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="product-tile aspect-square rounded-box p-6 sm:p-8">
        <img src={photos[active]} alt={name} className="size-full object-contain" />
      </div>
      {photos.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {photos.map((photo, index) => (
            <li key={photo}>
              <button type="button" onClick={() => setActive(index)} aria-label={`Show photo ${index + 1} of ${name}`} aria-pressed={index === active} className={`product-tile block size-16 rounded-field border-2 p-1 sm:size-20 ${index === active ? "border-primary" : "border-transparent"}`}>
                <img src={photo} alt="" className="size-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
