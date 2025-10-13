"use client";

import AuthenticatedSessionController from "@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/auth-layout";
import { Form, Head } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  // User can toggle between roles for testing / clarity
  const [role, setRole] = useState<"client" | "admin">("admin");

  return (
    <section className="max-w-7xl md:p-10 p-8 mx-auto ">
      <Head title="Admin Login" />

      <div className="flex min-h-screen w-full rounded-2xl border overflow-hidden shadow-lg">
        {/* Left side (Image + quote) */}
            <div className="hidden md:flex w-1/2 relative">
            {/* Full-cover image */}
            <img
                src="https://images.unsplash.com/photo-1717347424091-08275b73c918?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735"
                alt="Welcome"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay gradient for better readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Text content */}
            <div className="relative z-10 flex flex-col justify-end p-10 text-white">
                <p className="text-lg font-medium leading-snug max-w-md">
                “Simply all the tools that my team and I need.”
                </p>
                <p className="mt-2 text-sm text-gray-300">
                Karen Yue <br />
                Director of Digital Marketing Technology
                </p>
            </div>
            </div>

        {/* Right side (Login form) */}
        <div className="flex w-full md:w-1/2 items-center justify-center px-6 sm:px-12 bg-muted/30 p-10 dark:bg-muted/10">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back to Nucleus
              </h1>
              <p className="text-sm text-muted-foreground">
                Build your design system effortlessly with our powerful
                component library.
              </p>
            </div>

            {/* Toggle role (optional for testing or shared login page) */}
            <div className="flex justify-center gap-2 mb-2">
              <Button
                variant={role === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setRole("admin")}
              >
                Admin
              </Button>
              <Button
                variant={role === "client" ? "default" : "outline"}
                size="sm"
                onClick={() => setRole("client")}
              >
                Client
              </Button>
            </div>

            <Form
              action={AuthenticatedSessionController.store.url()}
              method="post"
              resetOnSuccess={["password"]}
              className="flex flex-col gap-6"
            >
              {({ processing, errors }) => (
                <>
                  <input type="hidden" name="role" value={role} />

                  <div className="grid gap-4">
                    {role === "admin" ? (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                          />
                          <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            autoComplete="current-password"
                            placeholder="Enter your password"
                          />
                          <InputError message={errors.password} />
                        </div>
                      </>
                    ) : (
                      <div className="grid gap-2">
                        <Label htmlFor="client_key">Client Key</Label>
                        <Input
                          id="client_key"
                          type="text"
                          name="client_key"
                          required
                          placeholder="Enter your client key"
                        />
                        <InputError message={errors.client_key} />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" name="remember" />
                        <Label htmlFor="remember">Remember me</Label>
                      </div>

                      {canResetPassword && (
                        <a
                          href="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="mt-2 w-full"
                      disabled={processing}
                    >
                      {processing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        `Log in as ${role === "admin" ? "Admin" : "Client"}`
                      )}
                    </Button>
                  </div>
                </>
              )}
            </Form>

            {/* Role indicator */}
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                You’re logging in as{" "}
                <span className="font-semibold text-primary">
                  {role === "admin" ? "Administrator" : "Client User"}
                </span>
                .
              </p>
            </div>

            {status && (
              <div className="text-center text-sm font-medium text-green-600">
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
