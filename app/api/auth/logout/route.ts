import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = request.nextUrl.clone();
        url.pathname = "/auth/login"
  const response =  NextResponse.redirect(url);

  response.cookies.set("directus_session_token", "", {});

  return response;
}
