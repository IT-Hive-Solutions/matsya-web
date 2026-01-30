"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/core/contants/endpoints";
import { LoginDTO, LoginSchema } from "@/core/dtos/login.dto";
import { mutateHandler } from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  // const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginDTO>({
    defaultValues: {
      password: "",
      email: "",
    },
    resolver: zodResolver(LoginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginDTO) =>
      mutateHandler(endpoints.auth.login, payload),
    onSuccess: (res) => {
      console.log("error...", { res });
      toast.success("Login Successful!");
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
      // router.push("/");
      // router.refresh();
    },
    onError: (err) => {
      console.log("error...", { err });
      toast.error("Error creating user!");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const handleSubmit = async (data: LoginDTO) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <main className="min-h-screen  from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl  from-primary to-primary/80 mb-4 shadow-lg">
            <span className="text-4xl">🐄</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Matsya</h1>
          <p className="text-muted-foreground text-sm">
            Livestock Tagging & Vaccination System
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-border/50">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Welcome Back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your phone number and password
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-full flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="someone@example.com"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 mt-6 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              Contact your administrator if you don't have credentials
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by secure authentication
        </p>
      </div>
    </main>
  );
}
