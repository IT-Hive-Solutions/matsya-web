import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const policyCookie = cookieStore.get('user_session');

    if (!policyCookie) {
        return NextResponse.json({ error: 'Cookie not found!' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(policyCookie.value));
}
export async function DELETE() {
    const cookieStore = await cookies();

    // Delete the cookie
    cookieStore.delete('directus_session_token');
    cookieStore.delete('directus_referesh_token');
    cookieStore.delete('directus_expires_at');

    return NextResponse.json({ message: 'Cookie deleted successfully' });
}