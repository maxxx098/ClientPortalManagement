import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface LeadOption {
    id: number;
    name: string;
    company_name?: string;
}

export default function ProposalCreate({
    leads = [],
}: {
    leads: LeadOption[];
}) {
    const params = new URLSearchParams(window.location.search);
    const initialLeadId = params.get('lead_id');

    const [form, setForm] = useState({
        lead_id: initialLeadId || '',
        title: '',
        total: '0',
        valid_until: '',
        scope: '',
        terms: '',
    });

    const [items, setItems] = useState([
        {
            title: 'Discovery & planning',
            description: '',
            quantity: 1,
            unit_price: 0,
        },
        {
            title: 'Design or build work',
            description: '',
            quantity: 1,
            unit_price: 0,
        },
    ]);

    useEffect(() => {
        const leadId = new URLSearchParams(window.location.search).get(
            'lead_id',
        );
        if (leadId) setForm((current) => ({ ...current, lead_id: leadId }));
    }, []);

    const updateItem = (
        index: number,
        field: string,
        value: string | number,
    ) => {
        setItems((current) =>
            current.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...form,
            items: items.map((item) => ({
                ...item,
                subtotal:
                    Number(item.quantity || 0) * Number(item.unit_price || 0),
            })),
        };

        router.post('/admin/proposals', payload, {
            onSuccess: () => router.visit('/admin/proposals'),
        });
    };

    return (
        <AppLayout>
            <Head title="Create proposal" />
            <div className="mx-auto max-w-5xl space-y-6 p-6">
                <div className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        Sales flow
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                        Create proposal
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 border border-border p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                Lead
                            </span>
                            <select
                                value={form.lead_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        lead_id: e.target.value,
                                    })
                                }
                                className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm"
                                required
                            >
                                <option value="">Select lead</option>
                                {(leads || []).map((lead) => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.company_name || lead.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                Proposal title
                            </span>
                            <input
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm"
                                required
                            />
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                Total
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                value={form.total}
                                onChange={(e) =>
                                    setForm({ ...form, total: e.target.value })
                                }
                                className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm font-mono tabular-nums"
                            />
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                                Valid until
                            </span>
                            <input
                                type="date"
                                value={form.valid_until}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        valid_until: e.target.value,
                                    })
                                }
                                className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm"
                            />
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            Proposal items
                        </div>
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="grid gap-3 border border-border p-4 md:grid-cols-4"
                            >
                                <div className="md:col-span-4 font-mono text-[10px] text-muted-foreground">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <input
                                    value={item.title}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-none border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="Item title"
                                />
                                <input
                                    value={item.description}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="rounded-none border border-border bg-background px-3 py-2 text-sm"
                                    placeholder="Description"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'quantity',
                                            Number(e.target.value || 0),
                                        )
                                    }
                                    className="rounded-none border border-border bg-background px-3 py-2 text-sm font-mono tabular-nums"
                                    placeholder="Qty"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) =>
                                        updateItem(
                                            index,
                                            'unit_price',
                                            Number(e.target.value || 0),
                                        )
                                    }
                                    className="rounded-none border border-border bg-background px-3 py-2 text-sm font-mono tabular-nums"
                                    placeholder="Unit price"
                                />
                            </div>
                        ))}
                    </div>

                    <label className="block space-y-2 text-sm">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Scope
                        </span>
                        <textarea
                            value={form.scope}
                            onChange={(e) =>
                                setForm({ ...form, scope: e.target.value })
                            }
                            className="min-h-28 w-full rounded-none border border-border bg-background px-3 py-2 text-sm"
                        />
                    </label>

                    <label className="block space-y-2 text-sm">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Terms
                        </span>
                        <textarea
                            value={form.terms}
                            onChange={(e) =>
                                setForm({ ...form, terms: e.target.value })
                            }
                            className="min-h-24 w-full rounded-none border border-border bg-background px-3 py-2 text-sm"
                        />
                    </label>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-none border-border"
                            onClick={() => router.visit('/admin/proposals')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-none bg-foreground text-background hover:bg-foreground/90"
                        >
                            Save proposal
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}