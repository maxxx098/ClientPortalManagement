import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface ProposalItem {
    id: number;
    title: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
    subtotal?: number;
}

interface Proposal {
    id: number;
    title: string;
    status?: string;
    valid_until?: string;
    total?: number;
    scope?: string;
    terms?: string;
    lead?: { name: string; company_name?: string };
    items?: ProposalItem[];
}

export default function ProposalShow({ proposal }: { proposal: Proposal }) {
    return (
        <AppLayout>
            <Head title={proposal.title} />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Proposal
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            {proposal.title}
                        </h1>
                    </div>
                    <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                        Send proposal
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Client
                        </p>
                        <div className="mt-3 text-sm">
                            {proposal.lead?.company_name ||
                                proposal.lead?.name ||
                                'Lead'}
                        </div>
                    </div>
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Status
                        </p>
                        <div className="mt-3">
                            <Badge
                                variant="outline"
                                className="rounded-none font-mono text-[10px] tracking-wider uppercase"
                            >
                                {proposal.status || 'draft'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="border border-border p-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Scope
                    </p>
                    <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                        {proposal.scope || 'No project scope added yet.'}
                    </p>
                </div>

                <div className="border border-border p-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Line items
                    </p>
                    <div className="mt-3 space-y-3">
                        {(proposal.items || []).length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                No items yet.
                            </div>
                        ) : (
                            proposal.items?.map((item, i) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between border-b border-border pb-2 last:border-b-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <div>
                                            <div className="font-medium">
                                                {item.title}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {item.description ||
                                                    'No description'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm tabular-nums">
                                        {item.quantity || 1} × $
                                        {Number(item.unit_price || 0).toFixed(
                                            2,
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
