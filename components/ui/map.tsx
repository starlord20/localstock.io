"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  lat?: number;
  lng?: number;
  zoom?: number;
  className?: string;
};

export default function Map({ lat = 37.7749, lng = -122.4194, zoom = 13, className = 'h-64 w-full' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;

    let mounted = true;

    // Dynamically import leaflet only on the client to avoid SSR errors
    (async () => {
      const L = (await import('leaflet')).default ?? (await import('leaflet'));
      // import CSS dynamically so it's applied only on client
      await import('leaflet/dist/leaflet.css');

      if (!mounted || !ref.current) return;

      const Icon = (L as any).Icon.Default as any;
      Icon.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // initialize map
      const map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lng], zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);

    })();

    return () => {
      mounted = false;
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (e) {}
        mapRef.current = null;
      }
    };
  // only run on client and when coords change
  }, [lat, lng, zoom]);

  return <div ref={ref} className={className} />;
}
