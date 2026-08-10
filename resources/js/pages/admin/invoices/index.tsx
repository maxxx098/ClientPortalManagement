import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Download,
  Trash2,
  FileText,
  ArrowLeft,
  Settings2,
  Mail,
  Copy,
  CreditCard,
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";

type Stats = {
  total_revenue: number;
  pending_amount: number;
  unpaid_invoices: number;
  overdue_amount: number;
  overdue_invoices: number;
  this_month_revenue: number;
  paid_invoices: number;
  average_days_to_pay: number | null;
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

interface AllInvoicesProps {
  invoices: any;
  clients?: any[];
  stats: Stats;
  monthlyRevenue: MonthlyRevenue[];
  filters: any;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AllInvoices({ invoices, clients = [], stats, monthlyRevenue = [], filters }: AllInvoicesProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices.data[0]?.id || null);
  const [form, setForm] = useState({
    client_key: "",
    invoice_date: "",
    due_date: "",
    amount: "",
    status: "unpaid",
    notes: "",
    internal_notes: "",
    tax_rate: "0",
    discount: "0",
    payment_terms: "Net 30",
    items: [{ description: "", quantity: 1, rate: 0 }],
  });
  const [filterForm, setFilterForm] = useState({
    status: filters?.status || "",
    client_key: filters?.client_key || "",
    date_from: filters?.date_from || "",
    date_to: filters?.date_to || "",
    amount_min: filters?.amount_min || "",
    amount_max: filters?.amount_max || "",
    search: filters?.search || "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "bank_transfer",
    reference_number: "",
    notes: "",
  });

  // The list is already filtered server-side (status/client/date/amount/search),
  // so we just render what the backend sent back for this page.
  const pageInvoices = invoices.data;
  const selectedInvoice = pageInvoices.find((inv: any) => inv.id === selectedInvoiceId) || pageInvoices[0];

  const applyFilters = (overrides: Partial<typeof filterForm> = {}) => {
    const next = { ...filterForm, ...overrides };
    setFilterForm(next);
    router.get('/admin/invoices', next, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!form.client_key) {
      alert("Please select a client");
      return;
    }

    if (form.items.length === 0 || !form.items[0].description) {
      alert("Please add at least one item");
      return;
    }

    const subtotal = calculateSubtotal();
    const taxRate = parseFloat(form.tax_rate) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discount = parseFloat(form.discount) || 0;
    const total = subtotal + taxAmount - discount;

    const submissionData = {
      ...form,
      subtotal: subtotal.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      amount: total.toFixed(2),
    };

    router.post(`/admin/clients/${form.client_key}/invoices`, submissionData, {
      onSuccess: () => {
        setForm({
          client_key: "",
          invoice_date: "",
          due_date: "",
          amount: "",
          status: "unpaid",
          notes: "",
          internal_notes: "",
          tax_rate: "0",
          discount: "0",
          payment_terms: "Net 30",
          items: [{ description: "", quantity: 1, rate: 0 }],
        });
        setShowDialog(false);
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
        alert('Error creating invoice. Check console for details.');
      },
    });
  };

  const handleFilterSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    const cleared = {
      status: "",
      client_key: "",
      date_from: "",
      date_to: "",
      amount_min: "",
      amount_max: "",
      search: "",
    };
    setFilterForm(cleared);
    router.get('/admin/invoices');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  type ItemField = "description" | "quantity" | "rate";
  const updateItem = (index: number, field: ItemField, value: string) => {
    const newItems = [...form.items];
    if (field === "quantity" || field === "rate") {
      newItems[index][field] = Number(value) as never;
    } else {
      newItems[index][field] = value as never;
    }
    setForm({ ...form, items: newItems });
  };

  const calculateSubtotal = () => {
    return form.items.reduce((sum, item) => {
      return sum + (parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.rate)) || 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = subtotal * (parseFloat(form.tax_rate) || 0) / 100;
    const discount = parseFloat(form.discount) || 0;
    return subtotal + tax - discount;
  };

  const toggleSelectInvoice = (id: any) => {
    if (selectedInvoices.includes(id)) {
      setSelectedInvoices(selectedInvoices.filter(i => i !== id));
    } else {
      setSelectedInvoices([...selectedInvoices, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.length === pageInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(pageInvoices.map((i: { id: any; }) => i.id));
    }
  };

  const bulkUpdateStatus = (status: string) => {
    if (selectedInvoices.length === 0) {
      alert("Please select invoices");
      return;
    }

    router.post('/admin/invoices/bulk-update', {
      invoice_ids: selectedInvoices,
      status: status,
    }, {
      onSuccess: () => setSelectedInvoices([]),
    });
  };

  const bulkDelete = () => {
    if (selectedInvoices.length === 0) {
      alert("Please select invoices");
      return;
    }

    if (confirm(`Delete ${selectedInvoices.length} invoice(s)?`)) {
      router.post('/admin/invoices/bulk-delete', {
        invoice_ids: selectedInvoices,
      }, {
        onSuccess: () => setSelectedInvoices([]),
      });
    }
  };

  const exportInvoices = () => {
    window.location.href = '/admin/invoices/export?' + new URLSearchParams(filterForm as any).toString();
  };

  const downloadPdf = (id: number) => {
    window.location.href = `/admin/invoices/${id}/pdf`;
  };

  const sendEmail = (id: number) => {
    if (!confirm('Send this invoice to the client by email?')) return;
    router.post(`/admin/invoices/${id}/send-email`);
  };

  const duplicateInvoice = (id: number) => {
    router.post(`/admin/invoices/${id}/duplicate`);
  };

  const deleteInvoice = (id: number) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    router.delete(`/admin/invoices/${id}`, {
      onSuccess: () => setSelectedInvoiceId(null),
    });
  };

  const openPaymentDialog = () => {
    setPaymentForm({
      amount: "",
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: "bank_transfer",
      reference_number: "",
      notes: "",
    });
    setShowPaymentDialog(true);
  };

  const submitPayment = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    router.post(`/admin/invoices/${selectedInvoice.id}/record-payment`, paymentForm, {
      onSuccess: () => setShowPaymentDialog(false),
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!isFinite(num)) return "₱0.00";
    return `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (date: string | number | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status: string): "default" | "outline" | "secondary" => {
    if (status === "overdue") return "default";
    if (status === "paid" || status === "partially_paid") return "secondary";
    return "outline";
  };

  const getPaidTotal = (invoice: any) => {
    if (!invoice?.payments) return 0;
    return invoice.payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
  };

  const activeFilterCount = Object.values(filterForm).filter(v => v).length;
  const maxMonthlyRevenue = Math.max(1, ...monthlyRevenue.map(m => m.revenue));

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-16">
        <main className="mx-auto w-full max-w-[1500px] px-8 py-8">
          {/* Masthead */}
          <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-5">
              <Button
                size="icon"
                variant="outline"
                className="rounded-none border-border"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={18} />
              </Button>
              <div>
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Billing
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">Invoices</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="icon" variant="outline" className="rounded-none border-border" onClick={() => setShowFilters(!showFilters)}>
                <Settings2 size={18} />
              </Button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-none bg-foreground font-mono text-xs font-bold uppercase tracking-wider text-background hover:bg-foreground/90">
                    <Plus size={16} />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-none border-border sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create a new invoice for a client.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Select Client *
                      </label>
                      <select
                        value={form.client_key}
                        onChange={(e) => setForm({ ...form, client_key: e.target.value })}
                        className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                        required
                      >
                        <option value="">-- Select a client --</option>
                        {clients && clients.length > 0 ? (
                          clients.map((client) => (
                            <option key={client.id} value={client.key}>
                              {client.name} (ID: {client.id})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No clients available</option>
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Invoice Date *
                        </label>
                        <Input
                          type="date"
                          value={form.invoice_date}
                          onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                          className="rounded-none border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Due Date *
                        </label>
                        <Input
                          type="date"
                          value={form.due_date}
                          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                          className="rounded-none border-border"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Payment Terms
                        </label>
                        <select
                          value={form.payment_terms}
                          onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                          className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                        >
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 45">Net 45</option>
                          <option value="Net 60">Net 60</option>
                          <option value="Due on Receipt">Due on Receipt</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Invoice Items *
                        </label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-none border-border">
                          <Plus className="mr-1 h-4 w-4" />
                          Add Item
                        </Button>
                      </div>

                      {form.items.map((item, index) => (
                        <div key={index} className="mb-2 space-y-2 border border-border p-3">
                          <div className="flex items-start justify-between">
                            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              Item {String(index + 1).padStart(2, "0")}
                            </label>
                            {form.items.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="rounded-none">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                          <Input
                            placeholder="Description (e.g., Website Development)"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="rounded-none border-border"
                            required
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              min="0"
                              step="0.01"
                              className="rounded-none border-border"
                              required
                            />
                            <Input
                              type="number"
                              placeholder="Rate (₱)"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', e.target.value)}
                              min="0"
                              step="0.01"
                              className="rounded-none border-border"
                              required
                            />
                            <Input
                              value={formatCurrency((item.quantity || 0) * (item.rate || 0))}
                              disabled
                              className="rounded-none border-border font-mono text-muted-foreground"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Tax Rate (%)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={form.tax_rate}
                          onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                          className="rounded-none border-border"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Discount (₱)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.discount}
                          onChange={(e) => setForm({ ...form, discount: e.target.value })}
                          className="rounded-none border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 border border-border p-4">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-mono tabular-nums">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {parseFloat(form.tax_rate) > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tax ({form.tax_rate}%)</span>
                          <span className="font-mono tabular-nums">{formatCurrency(calculateSubtotal() * (parseFloat(form.tax_rate) / 100))}</span>
                        </div>
                      )}
                      {parseFloat(form.discount) > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Discount</span>
                          <span className="font-mono tabular-nums">-{formatCurrency(form.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold text-foreground">
                        <span>Total</span>
                        <span className="font-mono tabular-nums">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Status *
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                        required
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Notes (Visible to Client)
                      </label>
                      <Textarea
                        placeholder="Add any notes about this invoice..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        className="rounded-none border-border"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Internal Notes (Private)
                      </label>
                      <Textarea
                        placeholder="Internal notes not visible to client..."
                        value={form.internal_notes}
                        onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                        rows={2}
                        className="rounded-none border-border"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="rounded-none border-border">
                        Cancel
                      </Button>
                      <Button type="submit" className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                        Create Invoice
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Financial Overview */}
            <div className="border border-border p-8 lg:col-span-2">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Overdue</p>
                  <h3 className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                    <span className="mr-1 text-lg font-normal text-muted-foreground">₱</span>
                    {stats.overdue_amount.toLocaleString()}
                  </h3>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Unpaid Amount
                  </p>
                  <h3 className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                    <span className="mr-1 text-lg font-normal text-muted-foreground">₱</span>
                    {stats.pending_amount.toLocaleString()}
                  </h3>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Average time to get paid
                  </p>
                  <h3 className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                    {stats.average_days_to_pay ?? "—"} <span className="text-base font-normal text-muted-foreground">days</span>
                  </h3>
                </div>
              </div>

              {/* Monthly revenue chart - real data from stats.monthlyRevenue */}
              <div className="mt-10">
                <div className="mb-4 flex justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {monthlyRevenue.map((m) => (
                    <span key={m.month}>{m.month}</span>
                  ))}
                </div>

                <div className="flex h-24 items-end gap-2">
                  {monthlyRevenue.map((m) => (
                    <div key={m.month} className="group relative flex-1">
                      <div
                        className="w-full bg-foreground transition-all"
                        style={{ height: `${Math.max(4, (m.revenue / maxMonthlyRevenue) * 96)}px` }}
                        title={`${m.month}: ${formatCurrency(m.revenue)}`}
                      />
                      <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100">
                        {formatCurrency(m.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Summary Card */}
            <div className="flex flex-col justify-between border border-border bg-foreground p-8 text-background">
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-background/60">
                  Total Revenue (Paid)
                </p>
                <div className="flex items-end gap-3">
                  <h3 className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                    <span className="mr-1 text-lg font-normal text-background/50">₱</span>
                    {stats.total_revenue.toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="border border-background/20 p-4">
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-background/50">This Month</p>
                  <p className="font-mono text-lg font-bold">{formatCurrency(stats.this_month_revenue)}</p>
                </div>
                <div className="border border-background/20 p-4">
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-background/50">Paid Invoices</p>
                  <p className="font-mono text-lg font-bold">{stats.paid_invoices}</p>
                </div>
              </div>

              <Button
                onClick={exportInvoices}
                className="mt-6 w-full gap-2 rounded-none bg-background py-5 text-sm font-bold text-foreground hover:bg-background/90"
              >
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="mr-2 flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Active Filters
              </span>
              <Badge variant="outline" className="rounded-none font-mono text-[11px]">
                {activeFilterCount}
              </Badge>
            </div>

            <select
              value={filterForm.status}
              onChange={(e) => applyFilters({ status: e.target.value })}
              className="rounded-none border border-border bg-background px-3 py-2 font-mono text-xs font-bold uppercase text-foreground"
            >
              <option value="">All statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterForm.client_key}
              onChange={(e) => applyFilters({ client_key: e.target.value })}
              className="rounded-none border border-border bg-background px-3 py-2 font-mono text-xs font-bold uppercase text-foreground"
            >
              <option value="">All customers</option>
              {clients.map((client) => (
                <option key={client.id} value={client.key}>
                  {client.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 rounded-none border-border font-mono text-xs font-bold uppercase"
            >
              More filters
            </Button>

            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search invoice number, customer... (press Enter)"
                value={filterForm.search}
                onChange={(e) => setFilterForm({ ...filterForm, search: e.target.value })}
                onKeyDown={handleSearchKeyDown}
                className="rounded-none border-border pl-9"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-8 border border-border p-6">
              <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Date From</label>
                  <Input
                    type="date"
                    value={filterForm.date_from}
                    onChange={(e) => setFilterForm({ ...filterForm, date_from: e.target.value })}
                    className="rounded-none border-border"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Date To</label>
                  <Input
                    type="date"
                    value={filterForm.date_to}
                    onChange={(e) => setFilterForm({ ...filterForm, date_to: e.target.value })}
                    className="rounded-none border-border"
                  />
                </div>

                <div />

                <div>
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Amount Min (₱)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={filterForm.amount_min}
                    onChange={(e) => setFilterForm({ ...filterForm, amount_min: e.target.value })}
                    className="rounded-none border-border"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Amount Max (₱)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={filterForm.amount_max}
                    onChange={(e) => setFilterForm({ ...filterForm, amount_max: e.target.value })}
                    className="rounded-none border-border"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2 md:col-span-3">
                  <Button type="button" variant="outline" onClick={clearFilters} className="rounded-none border-border">
                    Clear Filters
                  </Button>
                  <Button type="submit" className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                    Apply Filters
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <div className="mb-8 flex items-center justify-between border border-foreground bg-foreground/5 p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                {selectedInvoices.length} invoice(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateStatus('paid')}
                  className="gap-2 rounded-none border-border font-mono text-xs uppercase"
                >
                  Mark Paid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkUpdateStatus('unpaid')}
                  className="rounded-none border-border font-mono text-xs uppercase"
                >
                  Mark Unpaid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkDelete}
                  className="gap-2 rounded-none border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Main Panel */}
          <div className="flex min-h-[800px] flex-col border border-border">
            {/* Tab Switcher - wired to the real status filter */}
            <div className="relative flex items-center justify-center border-b border-border py-5">
              <div className="inline-flex border border-border">
                {STATUS_TABS.map((tab, i) => {
                  const isActive = (filterForm.status || "") === tab.value;
                  const count =
                    tab.value === "unpaid" ? stats.unpaid_invoices :
                    tab.value === "overdue" ? stats.overdue_invoices :
                    tab.value === "paid" ? stats.paid_invoices :
                    null;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => applyFilters({ status: tab.value })}
                      className={`flex items-center gap-2 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                        i > 0 ? "border-l border-border" : ""
                      } ${isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab.label}
                      {count !== null && (
                        <span className={`px-1.5 py-0.5 text-[10px] ${isActive ? "bg-background/20" : "bg-muted text-muted-foreground"}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="absolute right-6 flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={exportInvoices} className="rounded-none">
                  <Download size={18} />
                </Button>
              </div>
            </div>

            <div className="flex flex-1 gap-8 p-8">
              {/* List */}
              <div className="flex w-[38%] flex-col">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                    Invoices
                    <span className="ml-3 h-px w-16 bg-border" />
                  </h2>
                  {pageInvoices.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      {selectedInvoices.length === pageInvoices.length ? "Deselect all" : "Select all"}
                    </button>
                  )}
                </div>

                <div className="max-h-[680px] flex-col overflow-y-auto pr-2">
                  {pageInvoices.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">No invoices found</p>
                    </div>
                  ) : (
                    pageInvoices.map((invoice: any, i: number) => (
                      <div
                        key={invoice.id}
                        className={`flex w-full items-center justify-between border-b border-border py-4 text-left transition-colors first:pt-0 last:border-b-0 ${
                          selectedInvoiceId === invoice.id ? "" : "hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={() => toggleSelectInvoice(invoice.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded-none border-border"
                          />
                          <button onClick={() => setSelectedInvoiceId(invoice.id)} className="flex items-center gap-3 text-left">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div
                              className={`flex h-9 w-9 items-center justify-center border font-mono text-xs font-bold ${
                                selectedInvoiceId === invoice.id
                                  ? "border-foreground bg-foreground text-background"
                                  : "border-border text-muted-foreground"
                              }`}
                            >
                              {invoice.client_key_id || "N/A"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">#{invoice.invoice_number}</p>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                Due {formatDate(invoice.due_date)}
                              </p>
                            </div>
                          </button>
                        </div>

                        <button onClick={() => setSelectedInvoiceId(invoice.id)} className="flex items-center gap-6">
                          <Badge variant={getStatusVariant(invoice.status)} className="rounded-none font-mono text-[9px] uppercase">
                            {invoice.status}
                          </Badge>
                          <div className="min-w-[100px] text-right">
                            <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                              <span className="mr-1 font-normal text-muted-foreground">₱</span>
                              {parseFloat(invoice.amount).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Detail */}
              <div className="flex-1">
                {selectedInvoice ? (
                  <div className="flex h-full flex-col border border-border p-8">
                    <div className="mb-10 flex items-start justify-between">
                      <div className="flex gap-10">
                        <div>
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Invoice details
                          </p>
                          <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-semibold text-foreground">
                              <span className="text-muted-foreground">#</span> {selectedInvoice.invoice_number}
                            </h2>
                            <Badge variant={getStatusVariant(selectedInvoice.status)} className="rounded-none font-mono text-[10px] uppercase">
                              {selectedInvoice.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Client ID
                          </p>
                          <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
                            {selectedInvoice.client_key_id || "N/A"}
                          </span>
                        </div>
                        <div>
                          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Due Date
                          </p>
                          <p className="text-sm font-semibold text-foreground">{formatDate(selectedInvoice.due_date)}</p>
                          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {selectedInvoice.status === "overdue" ? "Overdue" : "On time"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8 grid grid-cols-4 gap-3">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((item: any, i: number) => (
                          <div key={i} className="border border-border p-5">
                            <p className="mb-6 font-mono text-lg font-semibold tabular-nums text-foreground">
                              <span className="mr-1 text-sm font-normal text-muted-foreground">₱</span>
                              {(parseFloat(item.quantity) * parseFloat(item.rate)).toLocaleString()}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 py-8 text-center">
                          <p className="text-sm text-muted-foreground">No items available</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-8">
                      <div className="flex gap-10">
                        <div>
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sub Total</p>
                          <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                            {formatCurrency(selectedInvoice.subtotal || selectedInvoice.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
                          <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                            {formatCurrency(selectedInvoice.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Balance Due</p>
                          <p className="font-mono text-xl font-semibold tabular-nums text-foreground">
                            {formatCurrency(Math.max(0, parseFloat(selectedInvoice.amount) - getPaidTotal(selectedInvoice)))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-none border-border"
                          onClick={() => downloadPdf(selectedInvoice.id)}
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-none border-border"
                          onClick={() => sendEmail(selectedInvoice.id)}
                          title="Email invoice to client"
                        >
                          <Mail size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-none border-border"
                          onClick={() => duplicateInvoice(selectedInvoice.id)}
                          title="Duplicate invoice"
                        >
                          <Copy size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-none border-border"
                          onClick={openPaymentDialog}
                          title="Record a payment"
                        >
                          <CreditCard size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-none border-border text-muted-foreground hover:text-foreground"
                          onClick={() => deleteInvoice(selectedInvoice.id)}
                          title="Delete invoice"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Link href={`/admin/invoices/${selectedInvoice.id}`}>
                          <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center border border-border">
                    <div className="text-center">
                      <FileText className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">Select an invoice to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {invoices.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-1">
              {Array.from({ length: invoices.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/admin/invoices?page=${page}`}
                  className={`border px-4 py-2 font-mono text-xs font-bold transition-colors ${
                    page === invoices.current_page
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {String(page).padStart(2, "0")}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="rounded-none border-border sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              {selectedInvoice ? `Add a payment against invoice #${selectedInvoice.invoice_number}.` : ""}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitPayment} className="mt-2 space-y-4">
            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Amount (₱) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="rounded-none border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Payment Date *
                </label>
                <Input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="rounded-none border-border"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Method *
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Reference Number
              </label>
              <Input
                value={paymentForm.reference_number}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                className="rounded-none border-border"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Notes
              </label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={2}
                className="rounded-none border-border"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)} className="rounded-none border-border">
                Cancel
              </Button>
              <Button type="submit" className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                Record Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}