import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
