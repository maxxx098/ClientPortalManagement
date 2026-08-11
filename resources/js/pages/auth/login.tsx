'use client';

import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import Logo from '@/assets/logo/Logo.png';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    clientKey?: string;
}

export default function Login({
    status,
    canResetPassword,
    clientKey,
}: LoginProps) {
    const [role, setRole] = useState<'client' | 'admin'>(
        clientKey ? 'client' : 'admin',
    );

    return (
        <section className="mx-auto max-w-7xl p-8 md:p-10">
            <Head title="Admin Login" />

            <div className="flex min-h-screen w-full overflow-hidden rounded-2xl border shadow-lg">
                {/* Left side (Image + quote) */}
                <div className="relative hidden w-1/2 md:flex">
                    {/* Full-cover image */}
                    <img
                        src="https://images.unsplash.com/photo-1717347424091-08275b73c918?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735"
                        alt="Welcome"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* Overlay gradient for better readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Text content */}
                    <div className="relative z-10 flex flex-col justify-end p-10 text-white">
                        <p className="max-w-md text-lg leading-snug font-medium">
                            “Simply all the tools I need to manage clients and
                            projects with ease.”
                        </p>
                        <p className="mt-2 text-sm text-gray-300">
                            Symon Falcatan <br />
                            CEO, SymVibe Web Development
                        </p>
                    </div>
                </div>

                {/* Right side (Login form) */}
                <div className="flex w-full items-center justify-center bg-muted/30 p-10 px-6 sm:px-12 md:w-1/2 dark:bg-muted/10">
                    <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2 text-center">
                            <div className="m-auto flex justify-center pb-3.5">
                                <img
                                    src={Logo}
                                    alt="ClientSync Logo"
                                    width={40}
                                    height={42}
                                    className="rounded-md"
                                />
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                Welcome back to{' '}
                                <span className="text-primary">ClientSync</span>
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Built for freelancers to manage clients and stay
                                in sync with every project.
                            </p>
                        </div>

                        {/* Toggle role (optional for testing or shared login page) */}
                        <div className="mb-2 flex justify-center gap-2">
                            <Button
                                variant={
                                    role === 'admin' ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setRole('admin')}
                            >
                                Admin
                            </Button>
                            <Button
                                variant={
                                    role === 'client' ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => setRole('client')}
                            >
                                Client
                            </Button>
                        </div>

                        <Form
                            action={AuthenticatedSessionController.store.url()}
                            method="post"
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <input
                                        type="hidden"
                                        name="role"
                                        value={role}
                                    />

                                    <div className="grid gap-4">
                                        {role === 'admin' ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">
                                                        Email address
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        required
                                                        autoFocus
                                                        autoComplete="email"
                                                        placeholder="email@example.com"
                                                    />
                                                    <InputError
                                                        message={errors.email}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="password">
                                                        Password
                                                    </Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        required
                                                        autoComplete="current-password"
                                                        placeholder="Enter your password"
                                                    />
                                                    <InputError
                                                        message={
                                                            errors.password
                                                        }
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="grid gap-2">
                                                <Label htmlFor="client_key">
                                                    Client Key
                                                </Label>
                                                <Input
                                                    id="client_key"
                                                    type="text"
                                                    name="client_key"
                                                    required
                                                    defaultValue={
                                                        clientKey ?? ''
                                                    }
                                                    placeholder="Enter your client key"
                                                />
                                                <InputError
                                                    message={errors.client_key}
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                />
                                                <Label htmlFor="remember">
                                                    Remember me
                                                </Label>
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
                                                `Log in as ${role === 'admin' ? 'Admin' : 'Client'}`
                                            )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>

                        {/* Role indicator */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                You’re logging in as{' '}
                                <span className="font-semibold text-primary">
                                    {role === 'admin'
                                        ? 'Administrator'
                                        : 'Client User'}
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
