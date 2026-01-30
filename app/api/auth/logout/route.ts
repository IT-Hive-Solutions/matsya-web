import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login"
  const response = NextResponse.redirect(url);

  response.cookies.delete("directus_session_token");
  const cookieStore = await cookies();

  cookieStore.delete('directus_session_token');
  cookieStore.delete('directus_referesh_token');
  cookieStore.delete('directus_expires_at');

  return response;
}
