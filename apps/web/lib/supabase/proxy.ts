import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/env";

function withSupabaseCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims verifies the asymmetrically signed JWT locally (refreshing it when expired),
  // avoiding a Supabase Auth round trip on every request. Pages still call getUser.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";

    return withSupabaseCookies(response, NextResponse.redirect(redirectUrl));
  }

  if (pathname === "/login" && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";

    return withSupabaseCookies(response, NextResponse.redirect(redirectUrl));
  }

  return response;
}
