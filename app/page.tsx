import Dashboard from "@/components/dashboard/dashboard";
import { ToastProvider } from "@/components/ui/toast";
import { getUserData } from "@/core/lib/dal";

export default async function Home() {
  const { user } = await getUserData();
  return <ToastProvider>{user && <Dashboard user={user} />}</ToastProvider>;
}
