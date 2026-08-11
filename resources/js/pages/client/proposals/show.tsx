import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface ProposalItem {
    id?: number;
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
    total?: number;
    valid_until?: string;
    scope?: string;
    terms?: string;
    items?: ProposalItem[];
    lead?: {
        id?: number;
        name?: string;
        company_name?: string;
        email?: string;
    };
}

interface Props {
    proposal: Proposal;
    lead?: Proposal['lead'];
}

export default function ClientProposalShow({ proposal, lead }: Props) {
    return (
        <AppLayout>
            <Head title={proposal.title} />
            <div className="mx-auto w-full max-w-[1100px] space-y-6 p-8">
                <div className="border-b border-border pb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        className="mb-4 rounded-none"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                        Proposal overview
                    </p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                        {proposal.title}
                    </h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Client
                        </p>
                        <div className="mt-3 text-base font-medium">
                            {lead?.company_name || lead?.name || 'Client'}
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
                        {proposal.scope ||
                            'No scope details have been shared yet.'}
                    </p>
                </div>

                <div className="border border-border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Line items
                        </p>
                        <div className="font-mono text-sm font-semibold text-foreground tabular-nums">
                            Total: ${Number(proposal.total || 0).toFixed(2)}
                        </div>
                    </div>

                    {(proposal.items || []).length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No line items attached.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {proposal.items?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border-b border-border pb-2 last:border-b-0"
                                >
                                    <div>
                                        <div className="font-medium text-foreground">
                                            {item.title}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.description ||
                                                'No description provided.'}
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm text-foreground tabular-nums">
                                        {item.quantity || 1} × $
                                        {Number(item.unit_price || 0).toFixed(
                                            2,
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {proposal.terms && (
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Terms
                        </p>
                        <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                            {proposal.terms}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
