"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Map from "./map";

export default function NearStatus() {
  const searchParams = useSearchParams();
  const zip = searchParams?.get("zip");
  const latParam = searchParams?.get("lat");
  const lngParam = searchParams?.get("lng");
  const zipParam = searchParams?.get("zip");

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (latParam && lngParam) {
      setCoords({ lat: Number(latParam), lng: Number(lngParam) });
      return;
    }

    // fall back to localStorage-stored coords or postal code set by LocationButton
    try {
      const raw = localStorage.getItem("localstock_coords");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.lat && parsed?.lng) {
          setCoords({ lat: Number(parsed.lat), lng: Number(parsed.lng) });
        }
      }
    } catch (e) {
      // ignore
    }
  }, [latParam, lngParam]);

  return (
    <>
      <h3 className="text-gray-500 mb-4">
        {zipParam || zip ? `Near: Zip ${zipParam ?? zip}` : coords ? `Near: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}` : 'Near: Location not set'}
      </h3>

      {coords ? (
        <div className="mb-4">
          <Map lat={coords.lat} lng={coords.lng} zoom={13} className="h-48 w-full rounded-md overflow-hidden" />
        </div>
      ) : null}
    </>
  );
}
