import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, BriefcaseBusiness, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

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

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    company_name: '',
    source: 'manual',
    budget: '',
    urgency: '',
    notes: '',
};

export default function LeadsIndex({ leads = [] }: { leads: Lead[] }) {
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [processing, setProcessing] = useState(false);
    const [showInviteSuccess, setShowInviteSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setShowInviteSuccess(params.get('converted') === '1');
    }, []);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setProcessing(true);
        router.post('/admin/leads', form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreate(false);
                setForm(emptyForm);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleConvert = (lead: Lead) => {
        if (!confirm(`Convert ${lead.name} to a client?`)) return;
        router.post(
            `/admin/leads/${lead.id}/convert`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedLead(null);
                    router.visit('/admin/leads?converted=1');
                },
            },
        );
    };

    const goToProposal = (lead: Lead) => {
        window.location.href = `/admin/proposals?lead_id=${lead.id}`;
    };

    return (
        <AppLayout>
            <Head title="Leads" />
            <div className="mx-auto w-full max-w-[1500px] space-y-6 p-8">
                {showInviteSuccess && (
                    <div className="border border-emerald-500/70 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                        Client portal invite sent successfully. The client can
                        now sign in with the generated key.
                    </div>
                )}

                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Freelance pipeline
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Leads
                        </h1>
                    </div>
                    <Button
                        className="gap-2 rounded-none bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => setShowCreate(true)}
                    >
                        <Plus className="h-4 w-4" />
                        New lead
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Pipeline
                        </p>
                        <div className="mt-3 font-mono text-3xl font-semibold tabular-nums">
                            {String(leads.length).padStart(2, '0')}
                        </div>
                    </div>
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Qualified
                        </p>
                        <div className="mt-3 font-mono text-3xl font-semibold tabular-nums">
                            {String(
                                leads.filter(
                                    (lead) => lead.status === 'qualified',
                                ).length,
                            ).padStart(2, '0')}
                        </div>
                    </div>
                    <div className="border border-border p-4">
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Won
                        </p>
                        <div className="mt-3 font-mono text-3xl font-semibold tabular-nums">
                            {String(
                                leads.filter((lead) => lead.status === 'won')
                                    .length,
                            ).padStart(2, '0')}
                        </div>
                    </div>
                </div>

                <div className="border border-border">
                    {leads.length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground">
                            No leads yet. Add your first inquiry to start the
                            pipeline.
                        </div>
                    ) : (
                        leads.map((lead, i) => (
                            <button
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                className="flex w-full flex-col gap-4 border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-accent md:flex-row md:items-center md:justify-between"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="mt-2.5 font-mono text-[10px] text-muted-foreground">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div className="flex h-10 w-10 items-center justify-center border border-border bg-muted">
                                        <BriefcaseBusiness className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-medium">
                                            {lead.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {lead.company_name ||
                                                'Independent client'}{' '}
                                            · {lead.email || 'No email'}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="rounded-none font-mono text-[9px] tracking-wider uppercase"
                                            >
                                                {lead.status || 'new'}
                                            </Badge>
                                            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                                {lead.source || 'manual'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right text-sm text-muted-foreground">
                                        <div>{lead.budget || 'Budget TBD'}</div>
                                        <div>
                                            {lead.urgency || 'Normal timeline'}
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-2 rounded-none border border-border px-3 py-1.5 text-sm text-muted-foreground">
                                        Open
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* View Lead Modal */}
            <Dialog
                open={!!selectedLead}
                onOpenChange={(open) => !open && setSelectedLead(null)}
            >
                <DialogContent className="max-w-2xl rounded-none border-border">
                    {selectedLead && (
                        <>
                            <DialogHeader>
                                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                    Lead overview
                                </p>
                                <DialogTitle className="text-2xl">
                                    {selectedLead.name}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="border border-border p-4">
                                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                        Contact
                                    </p>
                                    <div className="mt-3 space-y-2 text-sm">
                                        <div>
                                            Email:{' '}
                                            {selectedLead.email ||
                                                'Not provided'}
                                        </div>
                                        <div>
                                            Phone:{' '}
                                            {selectedLead.phone ||
                                                'Not provided'}
                                        </div>
                                        <div>
                                            Company:{' '}
                                            {selectedLead.company_name ||
                                                'Individual'}
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
                                                {selectedLead.status || 'new'}
                                            </Badge>
                                        </div>
                                        <div>
                                            Budget:{' '}
                                            {selectedLead.budget || 'Not set'}
                                        </div>
                                        <div>
                                            Urgency:{' '}
                                            {selectedLead.urgency || 'Standard'}
                                        </div>
                                        <div>
                                            Source:{' '}
                                            {selectedLead.source || 'Manual'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-border p-4">
                                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                    Notes
                                </p>
                                <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">
                                    {selectedLead.notes ||
                                        'No notes recorded yet.'}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-none border-border"
                                    onClick={() => goToProposal(selectedLead)}
                                >
                                    Create proposal
                                </Button>
                                <Button
                                    className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                                    onClick={() => handleConvert(selectedLead)}
                                >
                                    Convert to client
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Lead Modal */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="max-w-xl rounded-none border-border">
                    <DialogHeader>
                        <DialogTitle>New Lead</DialogTitle>
                        <DialogDescription>
                            Add a new inquiry to the pipeline.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                    Name *
                                </span>
                                <Input
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="rounded-none border-border"
                                    required
                                />
                            </label>
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                    Email
                                </span>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    className="rounded-none border-border"
                                />
                            </label>
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                    Phone
                                </span>
                                <Input
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="rounded-none border-border"
                                />
                            </label>
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                    Company
                                </span>
                                <Input
                                    value={form.company_name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            company_name: e.target.value,
                                        })
                                    }
                                    className="rounded-none border-border"
                                />
                            </label>
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                    Budget
                                </span>
                                <Input
                                    value={form.budget}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            budget: e.target.value,
                                        })
                                    }
                                    className="rounded-none border-border"
                                />
                            </label>
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                    Urgency
                                </span>
                                <Input
                                    value={form.urgency}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            urgency: e.target.value,
                                        })
                                    }
                                    className="rounded-none border-border"
                                />
                            </label>
                        </div>
                        <label className="block space-y-2 text-sm">
                            <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                                Notes
                            </span>
                            <Textarea
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                className="rounded-none border-border"
                                rows={3}
                            />
                        </label>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-none border-border"
                                onClick={() => setShowCreate(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                            >
                                {processing ? 'Saving...' : 'Save lead'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
