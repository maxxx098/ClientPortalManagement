import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Eye, Plus, Download, Mail, Filter, Trash2, RefreshCw, FileText, TrendingUp, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Card } from "@/components/ui/card";

type Stats = {
  total_revenue: number;
  pending_amount: number;
  unpaid_invoices: number;
  overdue_amount: number;
  overdue_invoices: number;
  this_month_revenue: number;
  paid_invoices: number;
};

interface AllInvoicesProps {
  invoices: any;
  clients?: any[];
  stats: Stats;
  monthlyRevenue: any[];
  filters: any;
}

export default function AllInvoices({ invoices, clients = [], stats, monthlyRevenue, filters }: AllInvoicesProps) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
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
  });

  const filteredInvoices = invoices.data.filter((invoice: { invoice_number: string; clientKey: { name: string; }; status: string; }) => {
    const searchLower = search.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.clientKey?.name?.toLowerCase().includes(searchLower) ||
      invoice.status?.toLowerCase().includes(searchLower)
    );
  });

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

    router.post(`/admin/clients/${form.client_key}/invoices`, form, {
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
    });
  };

  const handleFilterSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    router.get('/admin/invoices', filterForm, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    setFilterForm({
      status: "",
      client_key: "",
      date_from: "",
      date_to: "",
      amount_min: "",
      amount_max: "",
    });
    router.get('/admin/invoices');
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
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map((i: { id: any; }) => i.id));
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
    window.location.href = '/admin/invoices/export?' + new URLSearchParams(filterForm).toString();
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

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className=" p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className=" p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending_amount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.unpaid_invoices} invoices</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdue_amount)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.overdue_invoices} invoices</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 rounded-lg shadow-sm border ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.this_month_revenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">{stats.paid_invoices} paid</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Chart */}
          <div className=" p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Header */}
          <div className="flex justify-between items-center  p-4 rounded-lg shadow-sm border border-gray-200">
            <div>
              <h1 className="text-3xl font-bold">All Invoices</h1>
              <div className="text-sm text-gray-600 mt-1">
                Total: {invoices.total} invoice{invoices.total !== 1 ? "s" : ""}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportInvoices}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Fill in the details below to create a new invoice for a client.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Client *</label>
                      <select
                        value={form.client_key}
                        onChange={(e) => setForm({ ...form, client_key: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      >
                        <option value="">-- Select a client --</option>
                        {clients && clients.length > 0 ? (
                          clients.map((client) => (
                            <option key={client.id} value={client.key}>
                              {client.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No clients available</option>
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Invoice Date *</label>
                        <Input
                          type="date"
                          value={form.invoice_date}
                          onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Due Date *</label>
                        <Input
                          type="date"
                          value={form.due_date}
                          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Payment Terms</label>
                        <select
                          value={form.payment_terms}
                          onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
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
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Invoice Items *</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      {form.items.map((item, index) => (
                        <div key={index} className="border rounded-md p-3 mb-2 space-y-2">
                          <div className="flex justify-between items-start">
                            <label className="text-sm font-medium">Item {index + 1}</label>
                            {form.items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                          <Input
                            placeholder="Description (e.g., Website Development)"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
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
                              required
                            />
                            <Input
                              type="number"
                              placeholder="Rate (₱)"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', e.target.value)}
                              min="0"
                              step="0.01"
                              required
                            />
                            <Input
                              value={formatCurrency((item.quantity || 0) * (item.rate || 0))}
                              disabled
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={form.tax_rate}
                          onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Discount (₱)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.discount}
                          onChange={(e) => setForm({ ...form, discount: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {parseFloat(form.tax_rate) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Tax ({form.tax_rate}%):</span>
                          <span>{formatCurrency(calculateSubtotal() * (parseFloat(form.tax_rate) / 100))}</span>
                        </div>
                      )}
                      {parseFloat(form.discount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Discount:</span>
                          <span>-{formatCurrency(form.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-blue-600">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Status *</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notes (Visible to Client)</label>
                      <Textarea
                        placeholder="Add any notes about this invoice..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Internal Notes (Private)</label>
                      <Textarea
                        placeholder="Internal notes not visible to client..."
                        value={form.internal_notes}
                        onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Invoice</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filters */}
          <div className=" p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by invoice #, client, or status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={filterForm.status}
                    onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <select
                    value={filterForm.client_key}
                    onChange={(e) => setFilterForm({ ...filterForm, client_key: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Clients</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.key}>
                        {client.name}
                      </option>
                    ))}
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

                <div className="md:col-span-3 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <Button type="submit">Apply Filters</Button>
                </div>
              </form>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedInvoices.length} invoice(s) selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('paid')}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Paid
                </Button>
                <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('unpaid')}>
                  Mark Unpaid
                </Button>
                <Button size="sm" variant="outline" onClick={bulkDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className=" border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Invoice #</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice: { id: React.Key | null | undefined; invoice_number: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; clientKey: { key: any; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }; invoice_date: any; is_overdue: any; due_date: any; amount: any; status: string; }) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => toggleSelectInvoice(invoice.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                      <td className="px-4 py-3">
                        {invoice.clientKey ? (
                          <Link
                            href={`/admin/clients/${invoice.clientKey.key}/invoices`}
                            className="text-blue-600 hover:underline"
                          >
                            {invoice.clientKey.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">No client</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(invoice.invoice_date)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {invoice.is_overdue ? (
                          <span className="text-red-600 font-medium">{formatDate(invoice.due_date)}</span>
                        ) : (
                          formatDate(invoice.due_date)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(invoice.amount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "unpaid"
                              ? "bg-yellow-100 text-yellow-800"
                              : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/admin/invoices/${invoice.id}/pdf`, '_blank')}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-end">
       
          
          </div>
        </div>
      </div>
    </AppLayout>
  );
}