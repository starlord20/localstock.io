// app/deals/sony-wh-1000xm5-deal/page.tsx
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from 'next/image';

export default function SonyHeadphonesDealPage() {
  // Location will be provided via search/zip or browser geolocation at runtime
  const mockDeals = [
    { store: "Best Buy", price: "$349", status: "IN STOCK", distance: "1.8 mi", pickup: true },
    { store: "Walmart", price: "$349", status: "LOW STOCK", distance: "2.4 mi", pickup: true },
    { store: "Amazon", price: "$348", status: "ONLINE ONLY", distance: "N/A", pickup: false },
    { store: "Target", price: "$399", status: "UNAVAILABLE", distance: "5.5 mi", pickup: false },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* --- Left Column: Content & Deals --- */}
      <div className="md:w-2/3 p-6 md:p-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-800 mb-4">
          Sony WH-1000XM5 Headphones: Find the $349 Deal In Stock Near You
        </h1>
        <p className="text-gray-600 mb-6">
          The best price of Black Friday 2025 is **$349** (was $399). Use our live inventory search to find the deal for **local pickup** before it sells out.
        </p>

        {/* --- Image and Key Info --- */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8 border p-4 rounded-lg bg-gray-50">
          <Image
            src="https://www.bhphotovideo.com/images/images2500x2500/sony_wh1000xm5_b_wh_1000xm5_wireless_noise_canceling_1703066.jpg" 
            alt="Sony WH-1000XM5"
            width={150}
            height={150}
            className="rounded-lg object-contain"
          />
          <div>
            <h2 className="text-2xl font-bold">Current Deal Price: $349</h2>
            <p className="text-xl text-red-600 font-semibold">SAVE $50 (12% OFF)</p>
            <p className="text-gray-700 mt-2">Sale Confirmed at: Best Buy, Walmart, Amazon, B&H</p>
          </div>
        </div>

        {/* --- Local Inventory Section --- */}
        <h3 className="text-2xl font-bold mb-4 border-b pb-2">Local Inventory Results Near Your Area</h3>

        <div className="grid grid-cols-1 gap-4">
          {mockDeals.map((deal, index) => (
            <Card key={index} className={deal.status === "IN STOCK" ? "border-green-500 shadow-lg" : "border-gray-300"}>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="flex justify-between items-center text-xl">
                  {deal.store}
                  <span className={`text-sm font-semibold p-1 rounded ${
                    deal.status === "IN STOCK" ? "bg-green-100 text-green-700" :
                    deal.status === "LOW STOCK" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {deal.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center p-4 pt-0">
                <div className="text-2xl font-extrabold text-red-600">{deal.price}</div>
                <div className="text-sm text-gray-500">
                  {deal.pickup ? '✅ Available for Local Pickup' : '❌ Online Delivery Only'}
                  <span className="ml-4">{deal.distance !== 'N/A' && `(${deal.distance} away)`}</span>
                </div>
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Check Stock
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded text-sm text-yellow-700">
          **PRO TIP:** Walmart&apos;s major sale starts on Nov 25. Check back then! Best Buy is live now.
        </div>

      </div>

      {/* --- Right Column: Sticky Map & Search --- */}
      <div className="md:w-1/3 bg-gray-100 p-6 md:p-10 md:sticky md:top-0 md:h-screen flex flex-col">
        <h3 className="text-xl font-bold mb-4">Refine Your Search</h3>
        <div className="flex items-center space-x-2 mb-4">
          <Input placeholder="Enter New Zip Code" className="flex-1" />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </div>
        <Button variant="default" className="w-full bg-orange-600 hover:bg-orange-700 mb-6">
          <MapPin className="mr-2 h-4 w-4" />
          Search Nearby (Using Location)
        </Button>

        <div className="flex items-center justify-center flex-grow text-gray-500 bg-gray-200 rounded-lg">
          [Map View Placeholder]
        </div>
      </div>
    </div>
  );
}
