import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  Download, 
  Filter, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Clock
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

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

interface ClientInvoicesProps {
  invoices: any;
  stats: Stats;
  monthlyData: any[];
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
  monthlyData, 
  filters,
  clientInfo 
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

  const formatCurrency = (amount: ValueType) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      unpaid: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
      cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      partially_paid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric' 
  });

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="container mx-auto p-6 lg:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">My Invoices</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Welcome back, {clientInfo.name} • {currentDate}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={exportInvoices} className="rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_invoiced)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total_invoices} total invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_paid)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.paid_invoices} paid invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{formatCurrency(stats.pending_amount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.unpaid_invoices} unpaid invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdue_amount)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.overdue_invoices} overdue invoices
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice History (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="invoiced" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Invoiced"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="paid" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Paid"
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by invoice # or status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {showFilters && (
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={filterForm.status}
                      onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">All Statuses</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date From</label>
                    <Input
                      type="date"
                      value={filterForm.date_from}
                      onChange={(e) => setFilterForm({ ...filterForm, date_from: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date To</label>
                    <Input
                      type="date"
                      value={filterForm.date_to}
                      onChange={(e) => setFilterForm({ ...filterForm, date_to: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount Min (₱)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={filterForm.amount_min}
                      onChange={(e) => setFilterForm({ ...filterForm, amount_min: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount Max (₱)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={filterForm.amount_max}
                      onChange={(e) => setFilterForm({ ...filterForm, amount_max: e.target.value })}
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <Button type="button" variant="outline" onClick={clearFilters} className="flex-1">
                      Clear
                    </Button>
                    <Button type="submit" className="flex-1">Apply</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Invoice #</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Due Date</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Paid</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Balance</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice: any) => {
                      const totalPaid = invoice.payments?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
                      const balance = parseFloat(invoice.amount) - totalPaid;
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatDate(invoice.invoice_date)}</td>
                          <td className="px-4 py-3">
                            {invoice.status === 'overdue' ? (
                              <span className="text-red-600 font-medium">{formatDate(invoice.due_date)}</span>
                            ) : (
                              <span className="text-muted-foreground">{formatDate(invoice.due_date)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(invoice.amount)}</td>
                          <td className="px-4 py-3 text-right text-green-600">{formatCurrency(totalPaid)}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                              {formatCurrency(balance)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${getStatusColor(invoice.status)} border text-[10px] px-2 py-0.5`}>
                              {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1).replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Link href={`/client/invoices/${invoice.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/client/invoices/${invoice.id}/pdf`, '_blank')}
                              >
                                <FileText className="w-4 h-4" />
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
          </Card>

          {/* Pagination */}
          {invoices.last_page > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: invoices.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/client/invoices?page=${page}`}
                  className={`px-4 py-2 border rounded-xl transition-colors ${
                    page === invoices.current_page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}