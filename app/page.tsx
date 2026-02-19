import Dashboard from "@/components/dashboard/dashboard";
import { IUser } from "@/core/interfaces/user.interface";
import { getAccessToken } from "@/core/lib/auth";
import { getDirectusClient } from "@/core/lib/directus";
import { readMe } from "@directus/sdk";
import { redirect } from "next/navigation";

export default async function Home() {
  const token = await getAccessToken();
  const client = getDirectusClient(token!);
  const user = await client.request(readMe());

  if (user.needs_password_change) {
    redirect(`/auth/reset-password?email=${user.email}`);
  }
  return <div>{user && <Dashboard user={user as IUser} />}</div>;
}
