import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on the app routes + login; skip the marketing page, api, and static assets.
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/villas/:path*", "/team/:path*", "/requests/:path*", "/analytics/:path*", "/settings/:path*", "/login"],
};
