"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";

interface Merchant {
  slug: string;
  name: string;
  mainimage: string;
  location: { area?: string; city?: string };
  services: string[];
}

async function fetchMerchants({ pageParam = 0 }) {
  const res = await fetch(`/api/public/merchants?page=${pageParam}`);
  if (!res.ok) throw new Error("Failed to fetch merchants");
  return res.json();
}

export function MerchantGrid() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["merchants"],
    queryFn: fetchMerchants,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? false,
  });

  const loader = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchNextPage();
    });
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.pages.flatMap((page) =>
          page.merchants.map((m: Merchant) => (
            <Link
              key={m.slug}
              href={`/${encodeURIComponent(m.location.city ?? "")}/${encodeURIComponent(m.location.area ?? "")}/${m.slug}`}
              className="group"
            >
              <Card className="relative overflow-hidden cursor-pointer transition-transform group-hover:scale-[1.02]">
                <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image
                    src={m.mainimage}
                    alt={m.name}
                    width={300}
                    height={400}
                    className="object-cover w-full h-full rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-xl">
                  <div className="text-white text-lg font-semibold mb-1 truncate">{m.name}</div>
                  <div className="text-gray-200 text-xs mb-2">
                    {m.location.area && <span>{m.location.area}</span>}
                    {m.location.area && m.location.city && <span>, </span>}
                    {m.location.city && <span>{m.location.city}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(m.services) && m.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} className="text-xs bg-primary/80 text-white">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
      <div ref={loader} className="h-8" />
      {isFetchingNextPage && <div className="text-center py-4">Loading...</div>}
      {status === "error" && <div className="text-center py-4 text-red-500">Failed to load merchants.</div>}
    </div>
  );
}
