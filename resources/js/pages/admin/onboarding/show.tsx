import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

interface Step {
    id: number;
    title: string;
    slug: string;
    description?: string;
    status?: string;
    required?: boolean;
    order_index?: number;
}

interface Client {
    id: number;
    name?: string;
    email?: string;
    key?: string;
}

interface Session {
    id: number;
    status?: string;
    started_at?: string;
    completed_at?: string;
    kickoff_date?: string;
    notes?: string;
    steps?: Step[];
}

export default function OnboardingShow({
    client,
    session,
}: {
    client: Client;
    session: Session;
}) {
    const steps = session.steps || [];
    const completed = steps.filter(
        (step) => step.status === 'completed',
    ).length;
    const progress = steps.length
        ? Math.round((completed / steps.length) * 100)
        : 0;

    const updateStep = (stepId: number, status: string) => {
        router.patch(
            `/admin/onboarding/steps/${stepId}`,
            { status },
            {
                preserveScroll: true,
                onSuccess: () => window.location.reload(),
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Client onboarding" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Onboarding flow
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            {client.name || 'Client'} setup
                        </h1>
                    </div>
                    <Button
                        onClick={() =>
                            router.post(
                                `/admin/clients/${client.key}/onboarding/complete`,
                            )
                        }
                    >
                        Complete onboarding
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Status
                        </p>
                        <div className="mt-3 text-xl font-semibold">
                            {session.status || 'in_progress'}
                        </div>
                    </div>
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Progress
                        </p>
                        <div className="mt-3 text-xl font-semibold">
                            {progress}%
                        </div>
                    </div>
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Kickoff
                        </p>
                        <div className="mt-3 text-xl font-semibold">
                            {session.kickoff_date || 'Not scheduled'}
                        </div>
                    </div>
                </div>

                <div className="space-y-3 border border-border p-4">
                    {steps.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                            No onboarding steps yet.
                        </div>
                    ) : (
                        steps.map((step) => (
                            <div
                                key={step.id}
                                className="flex flex-col gap-3 border border-border p-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div>
                                    <div className="text-lg font-medium">
                                        {step.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {step.description || 'No description'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                        {step.status || 'pending'}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            updateStep(step.id, 'completed')
                                        }
                                    >
                                        Mark done
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
