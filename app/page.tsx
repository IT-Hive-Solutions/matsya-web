"use client";

import Dashboard from "@/components/dashboard/dashboard";
import { ToastProvider } from "@/components/ui/toast";
import { endpoints } from "@/core/contants/endpoints";
import { IUser } from "@/core/interfaces/user.interface";
import { fetchProtectedHandler } from "@/core/services/apiHandler/fetchHandler";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<IUser>();
  const router = useRouter();
  const { data: cookieData } = useQuery({
    queryKey: ["auth", "cookies"],
    queryFn: () => fetchProtectedHandler(endpoints.auth.cookies),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/auth/login")
    }
  }, []);
  console.log({ cookieData });

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <ToastProvider>
      {user && <Dashboard user={user} onLogout={handleLogout} />}
    </ToastProvider>
  );
}
