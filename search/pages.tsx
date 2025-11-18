// app/search/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// This is our MOCK DATA, simulating what the API will return.
const mockResults = [
  {
    id: 1, name: "Bose QuietComfort Ultra Headphones", store: "Best Buy",
    distance: "1.8 mi", price: "$299.00", status: "IN STOCK",
  },
  {
    id: 2, name: "Bose QuietComfort Ultra Headphones", store: "Walmart",
    distance: "2.4 mi", price: "$299.00", status: "LOW STOCK",
  },
  {
    id: 3, name: "Apple AirTag (4-Pack)", store: "Target",
    distance: "4.1 mi", price: "$65.00", status: "IN STOCK",
  },
  {
    id: 4, name: "Dell 15.6\" Inspiron Laptop", store: "Best Buy",
    distance: "1.8 mi", price: "$499.99", status: "UNAVAILABLE",
  },
];

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const searchQuery = searchParams?.q || "Bose Headphones";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-white text-gray-900">

      <div className="col-span-1 p-4 md:p-6 border-r border-gray-200">
        <form action="/search" className="flex w-full items-center space-x-2 pb-4 border-b border-gray-200">
          <Input
            type="text"
            name="q"
            defaultValue={searchQuery}
            className="h-10 text-md flex-1"
            aria-label="Search for a product"
          />
          <Button type="submit" size="default" className="h-10 bg-blue-600 hover:bg-blue-700">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <h2 className="text-xl font-semibold mt-4">
          Results for "{searchQuery}"
        </h2>
        <h3 className="text-gray-500 mb-4">Near: "New York, NY 10001"</h3>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {mockResults.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.store} ({item.distance})
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-xl font-bold">{item.price}</span>
                <span
                  className={`font-semibold ${
                    item.status === "IN STOCK" ? "text-green-600" :
                    item.status === "LOW STOCK" ? "text-amber-600" :
                    "text-red-600"
                  }`}
                >
                  {item.status}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="col-span-1 bg-gray-100 h-[400px] md:h-screen sticky top-0">
        <div className="flex items-center justify-center h-full text-gray-500">
          [Map Component Will Render Here]
        </div>
      </div>
    </div>
  );
}