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

  const { pathname } = request.nextUrl;

  // On /admin, getClaims verifies the signed JWT locally (refreshing it when expired),
  // avoiding a Supabase Auth round trip on every request; pages still call getUser.
  // /login uses getUser so a revoked session with an unexpired JWT is not bounced back
  // to /admin, where getUser would redirect to /login again.
  const user =
    pathname === "/login"
      ? (await supabase.auth.getUser()).data.user
      : (await supabase.auth.getClaims()).data?.claims;

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
