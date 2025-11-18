// lib/location-utils.ts
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export const GEO_COOKIE_KEY = 'user_location';

/**
 * Attempts to get the user's current geo-location and stores it in a cookie.
 * In a real app, this would use an API to convert coordinates to a zip code.
 */
export async function getGeoLocation() {
  if (typeof window === 'undefined') return;

  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // For simplicity, we resolve the coordinates. 
          // A real app uses a geocoding API here (e.g., Google Maps API).
          resolve(coords); 
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(new Error("Geolocation access denied or failed."));
        }
      );
    } else {
      reject(new Error("Geolocation not supported by this browser."));
    }
  });
}

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