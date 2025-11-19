// app/page.tsx
import Image from 'next/image'
import { LocationButton } from "@/components/ui/location-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
      <div className="text-center mb-6">
        <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl tracking-tight mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-transparent bg-clip-text drop-shadow-sm">
          LocalStock
        </h1>

        <div className="mx-auto mb-6 w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center">
          <Image src="/logo.png" alt="LocalStock" width={288} height={288} className="object-contain" />
        </div>

        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900">
          Find Holiday Deals In Stock.
        </h2>
        <h3 className="text-lg md:text-xl text-gray-600 mt-2">
          Get Them Today.
        </h3>
      </div>

      <form
        id="search-form"
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
        <LocationButton />
        <div className="flex items-center space-x-2">
          <label htmlFor="home-zip" className="sr-only">ZIP code</label>
          <Input id="home-zip" name="zip" form="search-form" type="text" placeholder="ZIP" className="h-10 w-28 text-sm" aria-label="ZIP code" />
          <button form="search-form" type="submit" className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Go</button>
        </div>
      </div>
    </main>
  );
  // Buy me a coffee script to be added in the future
  // <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="localstockonline" data-description="Support me on Buy me a coffee!" data-message="Thanks for stopping by and for your support! A coffee would be much appreciated." data-color="#FF813F" data-position="Right" data-x_margin="18" data-y_margin="18"></script>
}