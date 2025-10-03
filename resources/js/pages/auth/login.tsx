import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [role, setRole] = useState<"client" | "admin" | null>(null);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Choose your role and enter credentials"
        >
            <Head title="Log in" />

            {!role ? (
                // Step 1: Choose role
                <div className="flex flex-col gap-4 text-center">
                    <h2 className="text-lg font-semibold">Who are you logging in as?</h2>
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setRole("client")}
                            className="px-6"
                        >
                            Client
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setRole("admin")}
                            className="px-6"
                        >
                            Admin
                        </Button>
                    </div>
                </div>
            ) : (
                // Step 2: Role-specific form
                <Form
                    {...AuthenticatedSessionController.store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="role" value={role} />

                            <div className="grid gap-6">
                                {role === "client" ? (
                                    // Client login with client key
                                    <div className="grid gap-2">
                                        <Label htmlFor="client_key">Client Key</Label>
                                        <Input
                                            id="client_key"
                                            type="text"
                                            name="client_key"
                                            required
                                            autoFocus
                                            placeholder="Enter your client key"
                                        />
                                        <InputError message={errors.client_key} />
                                    </div>
                                ) : (
                                    // Admin login with email + password
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="email@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="remember" name="remember" tabIndex={3} />
                                            <Label htmlFor="remember">Remember me</Label>
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    className="mt-4 w-full"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    )}
                                    Log in as {role === "admin" ? "Admin" : "Client"}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            )}

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
