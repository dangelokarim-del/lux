import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv, isLive } from "@/lib/config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/** Routes that require an authenticated staff session. */
const PROTECTED = ["/dashboard", "/tasks", "/villas", "/team", "/requests", "/analytics"];

/**
 * Refreshes the Supabase session cookie on every request and gates the app:
 * unauthenticated users hitting a protected route are sent to /login; an
 * authenticated user hitting /login is sent to the dashboard. In demo mode
 * (no Supabase env) it is a no-op so the in-memory app stays open.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  // Demo mode: no backend, no auth wall.
  if (!isLive()) return response;

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // IMPORTANT: getUser() (not getSession) revalidates the JWT with the auth server.
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const onProtected = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && onProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
