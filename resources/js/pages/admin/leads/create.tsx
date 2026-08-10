import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function LeadCreate() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        source: 'website',
        budget: '',
        urgency: 'normal',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/leads', form, {
            onSuccess: () => router.visit('/admin/leads'),
        });
    };

    const labelClass =
        'font-mono text-[11px] uppercase tracking-wider text-muted-foreground';
    const fieldClass =
        'w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground';

    return (
        <AppLayout>
            <Head title="New lead" />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        New inquiry
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                        Add lead
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 border border-border p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                            <span className={labelClass}>Name</span>
                            <input
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className={fieldClass}
                                required
                            />
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Email</span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className={fieldClass}
                            />
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Phone</span>
                            <input
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                                className={fieldClass}
                            />
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Company</span>
                            <input
                                value={form.company_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        company_name: e.target.value,
                                    })
                                }
                                className={fieldClass}
                            />
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Source</span>
                            <select
                                value={form.source}
                                onChange={(e) =>
                                    setForm({ ...form, source: e.target.value })
                                }
                                className={fieldClass}
                            >
                                <option value="website">Website</option>
                                <option value="referral">Referral</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="email">Email</option>
                                <option value="other">Other</option>
                            </select>
                        </label>

                        <label className="space-y-2">
                            <span className={labelClass}>Budget</span>
                            <input
                                value={form.budget}
                                onChange={(e) =>
                                    setForm({ ...form, budget: e.target.value })
                                }
                                className={fieldClass}
                                placeholder="$500 - $1500"
                            />
                        </label>

                        <label className="space-y-2 md:col-span-2">
                            <span className={labelClass}>Urgency</span>
                            <select
                                value={form.urgency}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        urgency: e.target.value,
                                    })
                                }
                                className={fieldClass}
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label className="space-y-2 md:col-span-2">
                            <span className={labelClass}>Notes</span>
                            <textarea
                                value={form.notes}
                                onChange={(e) =>
                                    setForm({ ...form, notes: e.target.value })
                                }
                                className={`min-h-32 ${fieldClass}`}
                            />
                        </label>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/admin/leads')}
                            className="rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-none bg-foreground font-mono text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90"
                        >
                            Save lead
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}