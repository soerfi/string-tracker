import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    const expectedPassword = process.env.ADMIN_PASSWORD || 'tca2026';

    if (password === expectedPassword) {
      const response = NextResponse.json({ success: true });
      
      // Set HttpOnly cookie for extremely simple authentication
      response.cookies.set('tca_admin_auth', 'authenticated', {
        httpOnly: true,
        secure: false, // Allowed over HTTP for direct IP testing
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      
      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
