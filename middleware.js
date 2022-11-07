import { NextRequest, NextResponse } from "next/server";

export async function middleware(req = NextRequest) {
  const url = req.nextUrl.clone();
  const validPath = ["/", "/user/login", "/user/home"];
  if (validPath.includes(url.pathname)) {
    const isLoggedIn =
      typeof req.cookies.get("loggedIn") == "string"
        ? JSON.parse(req.cookies.get("loggedIn") || false)
        : req.cookies.get("loggedIn")?.value || false;
    url.pathname = `/${isLoggedIn ? "user/home" : "user/login"}`;
    return NextResponse.rewrite(url);
  }
}
