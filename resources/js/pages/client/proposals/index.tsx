import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileText } from 'lucide-react';

interface ProposalItem {
    id?: number;
    title: string;
    description?: string;
    quantity?: number;
    unit_price?: number;
}

interface Lead {
    id?: number;
    name: string;
    company_name?: string;
}

interface Proposal {
    id: number;
    title: string;
    status?: string;
    total?: number;
    valid_until?: string;
    scope?: string;
    lead?: Lead;
    items?: ProposalItem[];
}

interface Props {
    proposals: Proposal[];
    client?: {
        name?: string;
        email?: string;
    };
}

export default function ClientProposalsIndex({
    proposals = [],
    client,
}: Props) {
    return (
        <AppLayout>
            <Head title="My Proposal" />
            <div className="mx-auto w-full max-w-[1200px] space-y-6 p-8">
                <div className="border-b border-border pb-6">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                        Client workspace
                    </p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                        My proposal
                    </h1>
                    {client && (
                        <p className="mt-2 text-sm text-muted-foreground">
                            {client.name || 'Client'} ·{' '}
                            {client.email || 'No email on file'}
                        </p>
                    )}
                </div>

                {proposals.length === 0 ? (
                    <div className="border border-border p-10 text-center text-muted-foreground">
                        No proposals have been shared with you yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {proposals.map((proposal) => (
                            <Link
                                key={proposal.id}
                                href={`/client/proposals/${proposal.id}`}
                                className="block border border-border p-5 transition-colors hover:bg-accent"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center border border-border bg-muted">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-foreground">
                                                {proposal.title}
                                            </h2>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {proposal.lead?.company_name ||
                                                    proposal.lead?.name ||
                                                    'Client'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className="rounded-none font-mono text-[10px] tracking-wider uppercase"
                                        >
                                            {proposal.status || 'draft'}
                                        </Badge>
                                        <div className="font-mono text-sm font-semibold text-foreground tabular-nums">
                                            $
                                            {Number(
                                                proposal.total || 0,
                                            ).toFixed(2)}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
