import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin and all subpaths
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for our extremely simple custom auth cookie
    const authCookie = request.cookies.get('tca_admin_auth');
    
    if (!authCookie || authCookie.value !== 'authenticated') {
      // Missing or invalid auth cookie -> redirect to login
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Ensure middleware ONLY runs on specific paths
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
