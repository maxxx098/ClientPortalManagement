import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

interface LeadOption {
    id: number;
    name: string;
    company_name?: string;
}

interface ProposalItem {
    id?: number;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
}

interface Contract {
    id: number;
    status?: string;
    notes?: string;
    signed_at?: string;
    expires_at?: string;
}

interface Proposal {
    id: number;
    title: string;
    status?: string;
    valid_until?: string;
    total?: number;
    scope?: string;
    terms?: string;
    lead?: { id?: number; name: string; company_name?: string };
    items?: ProposalItem[];
    contract?: Contract | null;
}

const emptyItem: ProposalItem = { title: '', description: '', quantity: 1, unit_price: 0 };

const emptyForm = {
    lead_id: '',
    title: '',
    total: '0',
    valid_until: '',
    scope: '',
    terms: '',
};

export default function ProposalsIndex({
    proposals = [],
    leads = [],
}: {
    proposals: Proposal[];
    leads?: LeadOption[];
}) {
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [items, setItems] = useState<ProposalItem[]>([emptyItem, { ...emptyItem, title: '' }]);
    const [processing, setProcessing] = useState(false);

    // Auto-open create modal if navigated here with ?lead_id=
    useEffect(() => {
        const leadId = new URLSearchParams(window.location.search).get('lead_id');
        if (leadId) {
            setForm((current) => ({ ...current, lead_id: leadId }));
            setShowCreate(true);
        }
    }, []);

    const updateItem = (index: number, field: keyof ProposalItem, value: string | number) => {
        setItems((current) =>
            current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        );
    };

    const addItem = () => setItems((current) => [...current, { ...emptyItem }]);
    const removeItem = (index: number) =>
        setItems((current) => current.filter((_, i) => i !== index));

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.lead_id || !form.title.trim()) return;

        setProcessing(true);
        const payload = {
            ...form,
            items: items.map((item) => ({
                ...item,
                subtotal: Number(item.quantity || 0) * Number(item.unit_price || 0),
            })),
        };

        router.post('/admin/proposals', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreate(false);
                setForm(emptyForm);
                setItems([emptyItem, { ...emptyItem, title: '' }]);
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    };

    const handleSend = (proposal: Proposal) => {
        router.post(`/admin/proposals/${proposal.id}/send`, {}, { preserveScroll: true });
    };

    const handleCreateContract = (proposal: Proposal) => {
        router.post('/admin/contracts', { proposal_id: proposal.id }, {
            preserveScroll: true,
            onSuccess: () => setSelectedProposal(null),
        });
    };

    const handleSignContract = (contract: Contract) => {
        if (!confirm('Mark this contract as signed?')) return;
        router.post(`/admin/contracts/${contract.id}/sign`, {}, {
            preserveScroll: true,
            onSuccess: () => setSelectedProposal(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Proposals" />
            <div className="mx-auto w-full max-w-[1500px] space-y-6 p-8">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Client offers
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                            Proposals
                        </h1>
                    </div>
                    <Button
                        className="gap-2 rounded-none bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => setShowCreate(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Create proposal
                    </Button>
                </div>

                <div className="border border-border">
                    {proposals.length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground">
                            No proposals created yet.
                        </div>
                    ) : (
                        proposals.map((proposal, i) => (
                            <button
                                key={proposal.id}
                                onClick={() => setSelectedProposal(proposal)}
                                className="flex w-full items-center justify-between border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-accent"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <div className="text-lg font-medium">{proposal.title}</div>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>
                                                {proposal.lead?.company_name ||
                                                    proposal.lead?.name ||
                                                    'Lead'}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="rounded-none font-mono text-[9px] uppercase tracking-wider"
                                            >
                                                {proposal.status || 'draft'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-lg font-semibold tabular-nums">
                                        ${Number(proposal.total || 0).toFixed(2)}
                                    </div>
                                    <span className="mt-1 inline-block text-xs text-muted-foreground">
                                        View
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* View Proposal Modal */}
            <Dialog
                open={!!selectedProposal}
                onOpenChange={(open) => !open && setSelectedProposal(null)}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-none border-border">
                    {selectedProposal && (
                        <>
                            <DialogHeader>
                                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                    Proposal
                                </p>
                                <DialogTitle className="text-2xl">{selectedProposal.title}</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="border border-border p-4">
                                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                        Client
                                    </p>
                                    <div className="mt-3 text-sm">
                                        {selectedProposal.lead?.company_name ||
                                            selectedProposal.lead?.name ||
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
                                            className="rounded-none font-mono text-[10px] uppercase tracking-wider"
                                        >
                                            {selectedProposal.status || 'draft'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {selectedProposal.scope && (
                                <div className="border border-border p-4">
                                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                        Scope
                                    </p>
                                    <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                                        {selectedProposal.scope}
                                    </p>
                                </div>
                            )}

                            <div className="border border-border p-4">
                                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                    Line items
                                </p>
                                <div className="mt-3 space-y-3">
                                    {!selectedProposal.items || selectedProposal.items.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            No items on this proposal.
                                        </div>
                                    ) : (
                                        selectedProposal.items.map((item, i) => (
                                            <div
                                                key={item.id ?? i}
                                                className="flex items-center justify-between border-b border-border pb-2 last:border-b-0"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium">{item.title}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {item.description || 'No description'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-mono text-sm tabular-nums">
                                                    {item.quantity || 1} × ${Number(item.unit_price || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="mt-4 flex justify-end border-t border-border pt-3 font-mono text-lg font-semibold tabular-nums">
                                    Total: ${Number(selectedProposal.total || 0).toFixed(2)}
                                </div>
                            </div>

                            {/* Contract section */}
                            <div className="border border-border p-4">
                                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                                    Contract
                                </p>
                                {selectedProposal.contract ? (
                                    <div className="mt-3 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="rounded-none font-mono text-[10px] uppercase tracking-wider"
                                            >
                                                {selectedProposal.contract.status || 'draft'}
                                            </Badge>
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {selectedProposal.contract.expires_at
                                                    ? `Expires ${selectedProposal.contract.expires_at}`
                                                    : 'No expiry set'}
                                            </span>
                                        </div>
                                        {selectedProposal.contract.notes && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedProposal.contract.notes}
                                            </p>
                                        )}
                                        {selectedProposal.contract.status !== 'signed' && (
                                            <Button
                                                size="sm"
                                                className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                                                onClick={() => handleSignContract(selectedProposal.contract!)}
                                            >
                                                Mark as signed
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            No contract created for this proposal yet.
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-none border-border"
                                            onClick={() => handleCreateContract(selectedProposal)}
                                        >
                                            Create contract
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-none border-border"
                                    onClick={() => setSelectedProposal(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                                    onClick={() => handleSend(selectedProposal)}
                                >
                                    Send proposal
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Proposal Modal */}
            <Dialog
                open={showCreate}
                onOpenChange={(open) => {
                    setShowCreate(open);
                    if (!open) {
                        setForm(emptyForm);
                        setItems([emptyItem, { ...emptyItem, title: '' }]);
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-none border-border">
                    <DialogHeader>
                        <DialogTitle>Create Proposal</DialogTitle>
                        <DialogDescription>Build a proposal for a lead in your pipeline.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                    Lead *
                                </span>
                                <select
                                    value={form.lead_id}
                                    onChange={(e) => setForm({ ...form, lead_id: e.target.value })}
                                    className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select lead</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.company_name || lead.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                    Proposal title *
                                </span>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="rounded-none border-border"
                                    required
                                />
                            </label>

                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                    Total
                                </span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={form.total}
                                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                                    className="rounded-none border-border font-mono tabular-nums"
                                />
                            </label>

                            <label className="space-y-2 text-sm">
                                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                    Valid until
                                </span>
                                <Input
                                    type="date"
                                    value={form.valid_until}
                                    onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                                    className="rounded-none border-border"
                                />
                            </label>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                    Proposal items
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                    className="gap-1 rounded-none border-border"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add item
                                </Button>
                            </div>
                            {items.map((item, index) => (
                                <div key={index} className="border border-border p-4">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="font-mono text-[10px] text-muted-foreground">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-4">
                                        <input
                                            value={item.title}
                                            onChange={(e) => updateItem(index, 'title', e.target.value)}
                                            className="rounded-none border border-border bg-background px-3 py-2 text-sm"
                                            placeholder="Item title"
                                        />
                                        <input
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            className="rounded-none border border-border bg-background px-3 py-2 text-sm"
                                            placeholder="Description"
                                        />
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value || 0))}
                                            className="rounded-none border border-border bg-background px-3 py-2 text-sm font-mono tabular-nums"
                                            placeholder="Qty"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value || 0))}
                                            className="rounded-none border border-border bg-background px-3 py-2 text-sm font-mono tabular-nums"
                                            placeholder="Unit price"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <label className="block space-y-2 text-sm">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                Scope
                            </span>
                            <Textarea
                                value={form.scope}
                                onChange={(e) => setForm({ ...form, scope: e.target.value })}
                                className="min-h-28 rounded-none border-border"
                            />
                        </label>

                        <label className="block space-y-2 text-sm">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                Terms
                            </span>
                            <Textarea
                                value={form.terms}
                                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                                className="min-h-24 rounded-none border-border"
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
                                {processing ? 'Saving...' : 'Save proposal'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}