import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface Contract {
    id: number;
    status?: string;
    notes?: string;
    signed_at?: string;
    expires_at?: string;
    proposal?: { title: string };
}

export default function ContractShow({ contract }: { contract: Contract }) {
    return (
        <AppLayout>
            <Head title="Contract" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Agreement
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            {contract.proposal?.title || 'Contract'}
                        </h1>
                    </div>
                    <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                        Mark as signed
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Status
                        </p>
                        <div className="mt-3">
                            <Badge
                                variant="outline"
                                className="rounded-none font-mono text-[10px] tracking-wider uppercase"
                            >
                                {contract.status || 'draft'}
                            </Badge>
                        </div>
                    </div>
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Expiry
                        </p>
                        <div className="mt-3 font-mono text-sm">
                            {contract.expires_at || 'No expiry set'}
                        </div>
                    </div>
                </div>

                <div className="border border-border p-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Notes
                    </p>
                    <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                        {contract.notes || 'No notes added yet.'}
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
