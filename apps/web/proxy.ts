import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { publicSubdomain } from "@/lib/website-content/host";

export async function proxy(request: NextRequest) {
  const subdomain = publicSubdomain(request.headers.get("host"), process.env.ROOT_DOMAIN);
  if (subdomain) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/public-site";
    destination.search = "";
    // Only the homepage is a public site; other app paths must not leak onto it.
    if (request.nextUrl.pathname !== "/") destination.searchParams.set("missing", "1");
    return NextResponse.rewrite(destination);
  }
  if ((request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")) || request.nextUrl.pathname === "/login") {
    return updateSession(request);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images/|favicon.ico|icon.svg).*)"],
};
