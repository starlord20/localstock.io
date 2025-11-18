// lib/location-utils.ts


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
