"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { getGeoLocation } from "@/lib/location-utils";
import { useRouter } from "next/navigation";

// Client component to handle the location button click
export function LocationButton() {
  const router = useRouter();

  const handleLocationClick = async () => {
    try {
      const coords = await getGeoLocation();
      if (!coords) throw new Error('Unable to read coordinates');
      // persist coords so client components can read them
      try { localStorage.setItem('localstock_coords', JSON.stringify(coords)); } catch (e) {}

      // reverse geocode to get postal code (zip) using Nominatim
      let postalCode: string | null = null;
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
          { headers: { 'Accept': 'application/json' } }
        );
        if (resp.ok) {
          const json = await resp.json();
          postalCode = json?.address?.postcode ?? null;
        }
      } catch (e) {
        // ignore reverse geocode errors
      }

      // update URL with lat/lng and zip (if available)
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('lat', String(coords.lat));
        url.searchParams.set('lng', String(coords.lng));
        if (postalCode) url.searchParams.set('zip', String(postalCode));
        router.replace(url.pathname + url.search);
      } catch (e) {
        // fallback: reload
        window.location.reload();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Location Error: ${msg}. Please enter a zip code.`);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleLocationClick} 
      type="button"
      className="bg-white hover:bg-gray-100"
    >
      <MapPin className="mr-2 h-4 w-4" />
      Use My Current Location
    </Button>
  );
}
