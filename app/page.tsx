import Dashboard from "@/components/dashboard/dashboard";
import { getUserData } from "@/core/lib/dal";

export default async function Home() {
  const { user } = await getUserData();
  console.log({ user });

  return <div>{user && <Dashboard user={user} />}</div>;
}
