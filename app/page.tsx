// app/page.tsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Find Holiday Deals In Stock.
        </h1>
        <h2 className="text-2xl md:text-3xl text-gray-600 mt-2">
          Get Them Today.
        </h2>
      </div>

      <form
        action="/search"
        className="w-full max-w-2xl"
      >
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            name="q"
            placeholder='"AirPods Pro", "PS5", "Bose Headphones"...'
            className="h-12 text-lg flex-1"
            aria-label="Search for a product"
          />
          <Button type="submit" size="lg" className="h-12 bg-blue-600 hover:bg-blue-700">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <div className="flex items-center justify-center mt-6 space-x-4">
        <Button variant="outline" type="button" className="h-10">
          <MapPin className="mr-2 h-4 w-4" />
          Use My Current Location
        </Button>
        <span className="text-gray-500">or enter zip code</span>
      </div>
    </main>
  );
}