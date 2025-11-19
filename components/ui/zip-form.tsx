"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type ZipFormProps = {
  defaultQ?: string;
  defaultZip?: string;
};

export function ZipForm({ defaultQ = "", defaultZip = "" }: ZipFormProps) {
  const router = useRouter();
  const [zip, setZip] = React.useState(defaultZip || "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = defaultQ || "";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (zip) params.set("zip", zip);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center space-x-2 mb-4">
      <Input
        name="zip"
        placeholder="Enter Zip Code"
        className="flex-1 bg-white"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        maxLength={5}
      />
      <Button type="submit" variant="default" className="bg-blue-600 hover:bg-blue-700">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}

export default ZipForm;
