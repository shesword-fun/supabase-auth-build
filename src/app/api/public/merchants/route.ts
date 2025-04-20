import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url!);
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const PAGE_SIZE = 16;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("merchants")
    .select("slug,name,mainimage,location,services,active")
    .eq("active", true)
    .order("name")
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  type MerchantRow = {
    slug: string;
    name: string;
    mainimage: string;
    location: { area?: string; city?: string };
    services: string[];
    active: boolean;
  };

  const merchants = (data ?? []).map((m: Partial<MerchantRow>) => ({
    ...m,
    location: m.location || {},
    services: Array.isArray(m.services) ? m.services : [],
  }));

  const nextPage = (data && data.length === PAGE_SIZE) ? page + 1 : undefined;

  return NextResponse.json({ merchants, nextPage });
}
