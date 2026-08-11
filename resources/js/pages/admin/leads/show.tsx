import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

interface Lead {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company_name?: string;
    source?: string;
    status?: string;
    budget?: string;
    urgency?: string;
    notes?: string;
    created_at?: string;
}

export default function LeadShow({ lead }: { lead: Lead }) {
    return (
        <AppLayout>
            <Head title={lead.name} />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Lead overview
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            {lead.name}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-none border-border"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                window.location.href = `/admin/proposals/create?lead_id=${lead.id}`;
                            }}
                        >
                            Create proposal
                        </Button>
                        <Button
                            type="button"
                            className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                router.post(
                                    `/admin/leads/${lead.id}/convert`,
                                    {},
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            router.visit(
                                                '/admin/leads?converted=1',
                                            );
                                        },
                                    },
                                );
                            }}
                        >
                            Convert to client
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Contact
                        </p>
                        <div className="mt-3 space-y-2 text-sm">
                            <div>Email: {lead.email || 'Not provided'}</div>
                            <div>Phone: {lead.phone || 'Not provided'}</div>
                            <div>
                                Company: {lead.company_name || 'Individual'}
                            </div>
                        </div>
                    </div>

                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Sales info
                        </p>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span>Status:</span>
                                <Badge
                                    variant="outline"
                                    className="rounded-none font-mono text-[9px] tracking-wider uppercase"
                                >
                                    {lead.status || 'new'}
                                </Badge>
                            </div>
                            <div>Budget: {lead.budget || 'Not set'}</div>
                            <div>Urgency: {lead.urgency || 'Standard'}</div>
                            <div>Source: {lead.source || 'Manual'}</div>
                        </div>
                    </div>
                </div>

                <div className="border border-border p-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Notes
                    </p>
                    <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                        {lead.notes || 'No notes recorded yet.'}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
