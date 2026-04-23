import Dashboard from "@/components/dashboard/dashboard";
import { IUser } from "@/core/interfaces/user.interface";
import { getUserData } from "@/core/lib/getUserData";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await getUserData();

  if (user.needs_password_change) {
    redirect(`/auth/reset-password?email=${user.email}`);
  }
  console.log({ user });

  return (
    <div className="w-screen h-screen overflow-hidden">
      {user && <Dashboard user={user as IUser} />}
    </div>
  );
}
