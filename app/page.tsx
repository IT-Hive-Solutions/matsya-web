import Dashboard from "@/components/dashboard/dashboard";
import { IUser } from "@/core/interfaces/user.interface";
import { getUserData } from "@/core/lib/getUserData";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await getUserData();

  if (user.needs_password_change) {
    redirect(`/auth/reset-password?email=${user.email}`);
  }
  return <div>{user && <Dashboard user={user as IUser} />}</div>;
}
