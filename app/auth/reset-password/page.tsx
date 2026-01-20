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
import {
  ResetPasswordDTO,
  ResetPasswordSchema,
} from "@/core/dtos/reset-password.dto";
import { mutateHandler } from "@/core/services/apiHandler/mutateHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<ResetPasswordDTO>({
    defaultValues: {
      phone_number: params.get("phone") || "",
      new_password: "",
      old_password: "",
      confirm_new_password: "",
    },
    resolver: zodResolver(ResetPasswordSchema),
  });
  console.log({ formData: form.watch() });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: ResetPasswordDTO) =>
      mutateHandler(endpoints.auth["reset-password"], payload),
    onSuccess: (res) => {
      console.log("error...", { res });
      if (res.password_changed) {
        toast.success("Password Changed Successfully!.", {
          description: "Please login with your new password.",
        });
        router.push("/auth/login");
        return;
      }
      localStorage.setItem("user", JSON.stringify(res));
      toast.success("User created successfully!");
      router.push("/");
    },
    onError: (err) => {
      console.log("error...", { err });
      toast.error("Error creating user!");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
  const handleSubmit = async (data: ResetPasswordDTO) => {
    await resetPasswordMutation.mutateAsync(data);
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
                Reset Your Password
              </h2>
              <p className="text-sm text-muted-foreground">
                Please enter your current password and choose a new password
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-full flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="old_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
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
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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
                <FormField
                  control={form.control}
                  name="confirm_new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
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
