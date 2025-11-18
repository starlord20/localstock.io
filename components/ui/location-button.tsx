"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { getGeoLocation } from "@/lib/location-utils";

// Client component to handle the location button click
export function LocationButton() {
  const handleLocationClick = async () => {
    try {
      const coords: any = await getGeoLocation();
      alert(`Location Found! Lat: ${coords.lat}, Lng: ${coords.lng}. Now searching...`);
      // TODO: In the next iteration, this would redirect/refresh the search page
      // with the new coordinates to fetch API data.
    } catch (error: any) {
      alert(`Location Error: ${error.message}. Please enter a zip code.`);
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
