import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  Download,
  Filter,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";

type Stats = {
  total_invoiced: number;
  total_paid: number;
  pending_amount: number;
  overdue_amount: number;
  total_invoices: number;
  paid_invoices: number;
  unpaid_invoices: number;
  overdue_invoices: number;
};

type MonthlyDatum = {
  month: string;
  invoiced: number;
  paid: number;
};

interface ClientInvoicesProps {
  invoices: any;
  stats: Stats;
  monthlyData: MonthlyDatum[];
  filters: any;
  clientInfo: {
    name: string;
    email: string;
    company?: string;
  };
}

export default function ClientInvoices({
  invoices,
  stats,
  monthlyData = [],
  filters,
  clientInfo,
}: ClientInvoicesProps) {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterForm, setFilterForm] = useState({
    status: filters?.status || "",
    date_from: filters?.date_from || "",
    date_to: filters?.date_to || "",
    amount_min: filters?.amount_min || "",
    amount_max: filters?.amount_max || "",
  });

  // Note: this filters only the invoices already loaded on the current page.
  // The status/date/amount filters below submit to the server, same as the
  // admin invoices page, but there's no server-side "search" param wired up
  // for the client portal yet — share the client invoices controller if you
  // want this box to search across all pages too.
  const filteredInvoices = invoices.data.filter((invoice: any) => {
    const searchLower = search.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleFilterSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    router.get('/client/invoices', filterForm, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setFilterForm({
      status: "",
      date_from: "",
      date_to: "",
      amount_min: "",
      amount_max: "",
    });
    router.get('/client/invoices');
  };

  const exportInvoices = () => {
    window.location.href = '/client/invoices/export?' + new URLSearchParams(filterForm).toString();
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

  const formatStatusLabel = (status: string) =>
    status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const activeFilterCount = Object.values(filterForm).filter(v => v).length;
  const maxMonthly = Math.max(1, ...monthlyData.flatMap(m => [m.invoiced || 0, m.paid || 0]));

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-16">
        <main className="mx-auto w-full max-w-[1500px] px-8 py-8">

          {/* Masthead */}
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {clientInfo.name} • {currentDate}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">My Invoices</h1>
            </div>

            <Button
              variant="outline"
              onClick={exportInvoices}
              className="gap-2 rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider"
            >
              <Download size={16} />
              Export
            </Button>
          </div>

          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Total Invoiced</p>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {formatCurrency(stats.total_invoiced)}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {stats.total_invoices} total invoices
              </p>
            </div>

            <div className="border border-border bg-foreground p-6 text-background">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-background/60">Paid</p>
                <CheckCircle className="h-4 w-4 text-background/60" />
              </div>
              <h3 className="font-mono text-2xl font-semibold tabular-nums">
                {formatCurrency(stats.total_paid)}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-background/60">
                {stats.paid_invoices} paid invoices
              </p>
            </div>

            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Pending</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {formatCurrency(stats.pending_amount)}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {stats.unpaid_invoices} unpaid invoices
              </p>
            </div>

            <div className="border border-border p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Overdue</p>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {formatCurrency(stats.overdue_amount)}
              </h3>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {stats.overdue_invoices} overdue invoices
              </p>
            </div>
          </div>

          {/* Invoice History Chart */}
          <div className="mb-8 border border-border p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Invoice History
                <span className="ml-3 h-px w-16 bg-border" />
              </h2>
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 bg-foreground" /> Invoiced</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 border border-foreground" /> Paid</span>
              </div>
            </div>

            {monthlyData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No invoice history yet</p>
            ) : (
              <>
                <div className="flex h-40 items-end gap-4">
                  {monthlyData.map((m) => (
                    <div key={m.month} className="flex flex-1 items-end justify-center gap-1">
                      <div
                        className="w-full max-w-[18px] bg-foreground transition-all"
                        style={{ height: `${Math.max(4, ((m.invoiced || 0) / maxMonthly) * 160)}px` }}
                        title={`Invoiced: ${formatCurrency(m.invoiced || 0)}`}
                      />
                      <div
                        className="w-full max-w-[18px] border border-foreground bg-transparent transition-all"
                        style={{ height: `${Math.max(4, ((m.paid || 0) / maxMonthly) * 160)}px` }}
                        title={`Paid: ${formatCurrency(m.paid || 0)}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-4">
                  {monthlyData.map((m) => (
                    <span key={m.month} className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.month}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="text"
                placeholder="Search by invoice # or status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-none border-border pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider"
            >
              <Filter size={14} />
              Filters
              <Badge variant="outline" className="rounded-none font-mono text-[10px]">
                {activeFilterCount}
              </Badge>
            </Button>
          </div>

          {showFilters && (
            <div className="mb-8 border border-border p-6">
              <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Status</label>
                  <select
                    value={filterForm.status}
                    onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                    className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

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

                <div className="flex items-end gap-3">
                  <Button type="button" variant="outline" onClick={clearFilters} className="flex-1 rounded-none border-border">
                    Clear
                  </Button>
                  <Button type="submit" className="flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90">
                    Apply
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Invoice #</th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Due Date</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paid</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Balance</th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice: any) => {
                      const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
                      const balance = parseFloat(invoice.amount) - totalPaid;

                      return (
                        <tr key={invoice.id} className="transition-colors hover:bg-accent">
                          <td className="px-4 py-3 text-sm font-semibold text-foreground">{invoice.invoice_number}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{formatDate(invoice.invoice_date)}</td>
                          <td className="px-4 py-3 font-mono text-xs">
                            <span className={invoice.status === 'overdue' ? "font-semibold text-foreground" : "text-muted-foreground"}>
                              {formatDate(invoice.due_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums text-foreground">{formatCurrency(invoice.amount)}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-muted-foreground">{formatCurrency(totalPaid)}</td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(balance)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={getStatusVariant(invoice.status)} className="rounded-none font-mono text-[9px] uppercase">
                              {formatStatusLabel(invoice.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Link href={`/client/invoices/${invoice.id}`}>
                                <Button size="icon" variant="outline" className="rounded-none border-border">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="outline"
                                className="rounded-none border-border"
                                onClick={() => window.open(`/client/invoices/${invoice.id}/pdf`, '_blank')}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {invoices.last_page > 1 && (
            <div className="mt-8 flex justify-center gap-1">
              {Array.from({ length: invoices.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/client/invoices?page=${page}`}
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
    </AppLayout>
  );
}