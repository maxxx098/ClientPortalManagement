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
import { 
  Search, 
  Eye, 
  Plus, 
  Download, 
  Filter, 
  Trash2, 
  FileText, 
  ArrowUpRight, 
  ArrowLeft,
  Settings2,
  ChevronDown,
  Calendar as CalendarIcon,
  LayoutGrid,
  Info,
  Bell,
  Settings,
  CreditCard,
  RefreshCcw,
  CheckCircle2,
  Grid,
  Paperclip,
  Calendar
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

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
  });

  const filteredInvoices = invoices.data.filter((invoice: { invoice_number: string; clientKey: { name: string; }; status: string; }) => {
    const searchLower = search.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.clientKey?.name?.toLowerCase().includes(searchLower) ||
      invoice.status?.toLowerCase().includes(searchLower)
    );
  });

  const selectedInvoice = filteredInvoices.find((inv: any) => inv.id === selectedInvoiceId) || filteredInvoices[0];

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      unpaid: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const navItems = [
    { label: 'Estimates', icon: <FileText size={16} /> },
    { label: 'Invoices', icon: <CreditCard size={16} />, active: true },
    { label: 'Payments', icon: <RefreshCcw size={16} /> },
    { label: 'Recurring Invoices', icon: <RefreshCcw size={16} /> },
    { label: 'Checkouts', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen pb-16 flex flex-col bg-[#050505] selection:bg-[#bfff07] selection:text-black">
     
        <main className="flex-1 px-10 py-10 max-w-[1600px] mx-auto w-full">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-8">
              <button className="p-3 bg-[#18181b] rounded-full text-gray-500 hover:text-white transition-all border border-white/5 active:scale-90">
                <ArrowLeft size={22} />
              </button>
              <h1 className="text-[56px] font-bold tracking-tighter leading-none text-white">Invoices</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-4 bg-[#18181b] rounded-[22px] text-gray-500 hover:text-white transition-all border border-white/5">
                <Settings2 size={22} />
              </button>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                  <button className="flex items-center space-x-3 bg-[#18181b] text-white px-8 py-4.5 rounded-[22px] font-bold border border-white/5 hover:bg-[#27272a] transition-all shadow-xl group">
                    <Plus size={22} className="text-[#bfff07] group-hover:scale-110 transition-transform" />
                    <span className="text-[15px]">Create an invoice</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Invoice</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Fill in the details below to create a new invoice for a client.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Select Client *</label>
                      <select
                        value={form.client_key}
                        onChange={(e) => setForm({ ...form, client_key: e.target.value })}
                        className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white"
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Invoice Date *</label>
                        <Input
                          type="date"
                          value={form.invoice_date}
                          onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Due Date *</label>
                        <Input
                          type="date"
                          value={form.due_date}
                          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Payment Terms</label>
                        <select
                          value={form.payment_terms}
                          onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                          className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white"
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
                        <label className="block text-sm font-medium text-gray-300">Invoice Items *</label>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-white/10">
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      {form.items.map((item, index) => (
                        <div key={index} className="border border-white/10 rounded-md p-3 mb-2 space-y-2 bg-white/5">
                          <div className="flex justify-between items-start">
                            <label className="text-sm font-medium text-gray-300">Item {index + 1}</label>
                            {form.items.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            )}
                          </div>
                          <Input
                            placeholder="Description (e.g., Website Development)"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
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
                              className="bg-white/5 border-white/10 text-white"
                              required
                            />
                            <Input
                              type="number"
                              placeholder="Rate (₱)"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', e.target.value)}
                              min="0"
                              step="0.01"
                              className="bg-white/5 border-white/10 text-white"
                              required
                            />
                            <Input
                              value={formatCurrency((item.quantity || 0) * (item.rate || 0))}
                              disabled
                              className="bg-white/10 border-white/10 text-gray-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Tax Rate (%)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={form.tax_rate}
                          onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Discount (₱)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.discount}
                          onChange={(e) => setForm({ ...form, discount: e.target.value })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-md space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {parseFloat(form.tax_rate) > 0 && (
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Tax ({form.tax_rate}%):</span>
                          <span>{formatCurrency(calculateSubtotal() * (parseFloat(form.tax_rate) / 100))}</span>
                        </div>
                      )}
                      {parseFloat(form.discount) > 0 && (
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Discount:</span>
                          <span>-{formatCurrency(form.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10 text-white">
                        <span>Total:</span>
                        <span className="text-yellow-500">{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Status *</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white"
                        required
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Notes (Visible to Client)</label>
                      <Textarea
                        placeholder="Add any notes about this invoice..."
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Internal Notes (Private)</label>
                      <Textarea
                        placeholder="Internal notes not visible to client..."
                        value={form.internal_notes}
                        onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
                        rows={2}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDialog(false)}
                        className="border-white/10"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-400">Create Invoice</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Financial Overview Card */}
            <div className="lg:col-span-2 bg-[#18181b] rounded-[45px] p-10 relative border border-white/5">
              <div className="grid grid-cols-3 gap-12">
                <div>
                  <p className="text-gray-500 text-[13px] font-medium mb-3">Overdue</p>
                  <h3 className="text-[44px] font-bold tracking-tight leading-none text-white">
                    <span className="text-gray-500 text-[26px] mr-1 font-normal">₱</span>
                    {stats.overdue_amount.toLocaleString()}
                  </h3>
                </div>
                <div>
                  <p className="text-gray-500 text-[13px] font-medium mb-3">Due within next month</p>
                  <h3 className="text-[44px] font-bold tracking-tight leading-none text-white">
                    <span className="text-gray-500 text-[26px] mr-1 font-normal">₱</span>
                    {stats.pending_amount.toLocaleString()}
                  </h3>
                </div>
                <div>
                  <p className="text-gray-500 text-[13px] font-medium mb-3">Average time to get paid</p>
                  <h3 className="text-[44px] font-bold tracking-tight leading-none text-white">
                    12 <span className="text-xl font-normal text-gray-500 ml-1">days</span>
                  </h3>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="mt-14 relative">
                <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-6 uppercase tracking-[0.15em]">
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
                
                <div className="h-[2px] bg-gray-800 rounded-full relative flex items-center">
                  <div className="absolute left-0 w-[24%] h-[6px] bg-[#bfff07] rounded-full shadow-[0_0_20px_rgba(191,255,7,0.3)]" />
                  <div className="absolute left-[26%] w-[24%] h-[6px] bg-[#bfff07] rounded-full shadow-[0_0_20px_rgba(191,255,7,0.3)]" />
                  <div className="absolute left-[52%] w-[33%] h-[6px] bg-[#bfff07] rounded-full shadow-[0_0_20px_rgba(191,255,7,0.3)]" />
                  <div className="absolute right-[5%] w-5 h-5 bg-[#bfff07] rounded-full border-[5px] border-[#18181b] shadow-lg" />
                </div>
                
                <div className="flex justify-between mt-8">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/${i+50}/60/60`} className="w-10 h-10 rounded-full border-[3px] border-[#18181b] grayscale hover:grayscale-0 transition-all cursor-pointer" alt="user" />
                    ))}
                  </div>
                  <div className="flex -space-x-3">
                    {[6, 7, 8].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/${i+60}/60/60`} className="w-10 h-10 rounded-full border-[3px] border-[#18181b] grayscale hover:grayscale-0 transition-all cursor-pointer" alt="user" />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-[#27272a] border-[3px] border-[#18181b] flex items-center justify-center text-[11px] font-bold text-gray-500">+12</div>
                  </div>
                  <div className="flex -space-x-3">
                    {[9, 10].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/${i+70}/60/60`} className="w-10 h-10 rounded-full border-[3px] border-[#18181b] grayscale hover:grayscale-0 transition-all cursor-pointer" alt="user" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Card */}
            <div className="bg-[#18181b] rounded-[45px] p-10 flex flex-col justify-between relative border border-white/5">
              <button className="absolute top-8 right-8 p-3 bg-[#27272a] rounded-full hover:bg-white hover:text-black transition-all">
                <ArrowUpRight size={22} />
              </button>

              <div>
                <p className="text-gray-500 text-[13px] font-medium mb-3">Available for Instant Payout</p>
                <div className="flex items-end space-x-3">
                   <h3 className="text-[44px] font-bold tracking-tight leading-none text-white">
                      <span className="text-gray-500 text-[26px] mr-1 font-normal">₱</span>
                      {stats.total_revenue.toLocaleString()}
                   </h3>
                   <span className="bg-[#27272a] text-gray-400 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1">Expects</span>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3.5">
                <div className="bg-[#27272a]/40 p-5 rounded-[28px] border border-white/5">
                  <p className="text-gray-600 text-[10px] font-bold mb-4">*4443</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 italic">Visa</p>
                </div>
                <div className="bg-[#bfff07] p-5 rounded-[28px] shadow-[0_10px_30px_-5px_rgba(191,255,7,0.3)]">
                  <p className="text-black/60 text-[10px] font-bold mb-4">#177210</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black italic">Stripe</p>
                </div>
                <div className="bg-[#27272a]/40 p-5 rounded-[28px] border border-white/5">
                  <p className="text-gray-600 text-[10px] font-bold mb-4">#711221</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-300 italic">PayPal</p>
                </div>
              </div>

              <button className="w-full mt-8 bg-white text-black py-5 rounded-full text-sm font-bold hover:brightness-90 transition-all shadow-xl">
                Pay out now
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-5 mb-10">
            <div className="flex items-center space-x-3 mr-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-600">Active filters</span>
              <span className="w-7 h-7 bg-[#bfff07] text-black text-[12px] font-black rounded-full flex items-center justify-center shadow-lg">
                {Object.values(filterForm).filter(v => v).length}
              </span>
            </div>
            
            <div className="flex space-x-3.5 flex-1 items-center">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-3 bg-[#18181b] px-6 py-4 rounded-[22px] text-[13px] font-bold text-gray-400 whitespace-nowrap border border-white/5 hover:border-white/20 transition-all hover:text-white"
              >
                <span>All statuses</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center space-x-3 bg-[#18181b] px-6 py-4 rounded-[22px] text-[13px] font-bold text-gray-400 whitespace-nowrap border border-white/5 hover:border-white/20 transition-all hover:text-white">
                <span>All customers</span>
                <ChevronDown size={14} />
              </button>
              <button className="flex items-center space-x-3 bg-[#18181b] px-6 py-4 rounded-[22px] text-[13px] font-bold text-gray-400 whitespace-nowrap border border-white/5 hover:border-white/20 transition-all hover:text-white">
                <span>November 2023</span>
                <CalendarIcon size={14} />
              </button>
              
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="text" 
                  placeholder="Search invoice number, customer..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#18181b] rounded-[22px] pl-14 pr-6 py-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#bfff07]/30 border border-white/5 text-white placeholder:text-gray-700 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-[#18181b] rounded-[35px] p-8 mb-10 border border-white/5">
              <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Status</label>
                  <select
                    value={filterForm.status}
                    onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-[#27272a] text-white focus:ring-2 focus:ring-[#bfff07]/30"
                  >
                    <option value="">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Client</label>
                  <select
                    value={filterForm.client_key}
                    onChange={(e) => setFilterForm({ ...filterForm, client_key: e.target.value })}
                    className="w-full px-4 py-3 border border-white/10 rounded-2xl bg-[#27272a] text-white focus:ring-2 focus:ring-[#bfff07]/30"
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
                  <label className="block text-sm font-medium mb-2 text-gray-400">Date From</label>
                  <Input
                    type="date"
                    value={filterForm.date_from}
                    onChange={(e) => setFilterForm({ ...filterForm, date_from: e.target.value })}
                    className="bg-[#27272a] border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-[#bfff07]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Date To</label>
                  <Input
                    type="date"
                    value={filterForm.date_to}
                    onChange={(e) => setFilterForm({ ...filterForm, date_to: e.target.value })}
                    className="bg-[#27272a] border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-[#bfff07]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Amount Min (₱)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={filterForm.amount_min}
                    onChange={(e) => setFilterForm({ ...filterForm, amount_min: e.target.value })}
                    className="bg-[#27272a] border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-[#bfff07]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-400">Amount Max (₱)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={filterForm.amount_max}
                    onChange={(e) => setFilterForm({ ...filterForm, amount_max: e.target.value })}
                    className="bg-[#27272a] border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-[#bfff07]/30"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={clearFilters}
                    className="px-6 py-3 bg-[#27272a] border border-white/10 rounded-full text-sm font-bold text-gray-400 hover:text-white transition-all"
                  >
                    Clear Filters
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-3 bg-[#bfff07] text-black rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-[0_10px_30px_-5px_rgba(191,255,7,0.3)]"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <div className="bg-[#bfff07]/10 border border-[#bfff07]/20 p-6 rounded-[35px] flex items-center justify-between backdrop-blur-xl mb-10">
              <span className="text-sm font-bold text-white">
                {selectedInvoices.length} invoice(s) selected
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => bulkUpdateStatus('paid')}
                  className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mark Paid
                </button>
                <button 
                  onClick={() => bulkUpdateStatus('unpaid')}
                  className="px-5 py-3 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all"
                >
                  Mark Unpaid
                </button>
                <button 
                  onClick={bulkDelete}
                  className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-red-500/30 rounded-full text-sm font-bold hover:bg-red-500/10 transition-all text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Main Dashboard Panel */}
          <div className="bg-white rounded-[60px] overflow-hidden flex flex-col min-h-[850px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
             {/* Dynamic Floating Tab Switcher */}
             <div className="flex items-center justify-center pt-8 pb-4 relative z-10">
                <div className="bg-[#0c0c0e] p-2 rounded-full flex space-x-1 shadow-2xl border border-white/5">
                  <button className="px-8 py-3.5 text-[13px] font-bold text-gray-500 hover:text-white transition-all">All Invoices</button>
                  <button className="px-8 py-3.5 text-[13px] font-bold text-gray-500 hover:text-white flex items-center space-x-3 group">
                    <span>Draft</span>
                    <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md group-hover:bg-gray-700 transition-colors">3</span>
                  </button>
                  <button className="px-10 py-3.5 text-[13px] font-black text-black bg-[#bfff07] rounded-full flex items-center space-x-3 shadow-[0_8px_30px_rgba(191,255,7,0.4)]">
                    <span className="uppercase tracking-widest">Unpaid</span>
                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-md">{stats.unpaid_invoices}</span>
                  </button>
                </div>
                
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                  <button 
                    onClick={exportInvoices}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-black transition-colors"
                  >
                    <Download size={22} />
                  </button>
                  <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full text-black transition-colors">
                    <Info size={22} />
                  </button>
                </div>
             </div>

             <div className="flex-1 flex p-10 gap-10">
                {/* Left Column: List Sidebar */}
                <div className="w-[38%] flex flex-col">
                   <h2 className="text-[26px] font-black text-black mb-10 tracking-tight flex items-center">
                      Unpaid Invoices
                      <div className="ml-4 h-[2px] flex-1 bg-gray-100 rounded-full" />
                   </h2>
                   
                   <div className="space-y-4 pr-4 overflow-y-auto max-h-[700px]">
                      {filteredInvoices.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 opacity-20 mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-500">No invoices found</p>
                        </div>
                      ) : (
                        filteredInvoices.map((invoice: any) => (
                          <div
                            key={invoice.id}
                            onClick={() => setSelectedInvoiceId(invoice.id)}
                            className={`group flex items-center justify-between p-5 rounded-[30px] cursor-pointer transition-all duration-300 border ${
                              selectedInvoiceId === invoice.id 
                                ? 'bg-[#18181b] border-white/5 text-white shadow-2xl scale-[1.02]' 
                                : 'border-transparent text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                                selectedInvoiceId === invoice.id ? 'bg-[#bfff07] text-black' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {invoice.client_key_id || 'N/A'}
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${selectedInvoiceId === invoice.id ? 'text-white' : 'text-black'}`}>
                                  #{invoice.invoice_number}
                                </p>
                                <p className={`text-[11px] font-medium ${selectedInvoiceId === invoice.id ? 'text-gray-500' : 'text-gray-400'}`}>
                                  Due {formatDate(invoice.due_date)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-10">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                invoice.id === selectedInvoiceId 
                                  ? 'bg-white text-black' 
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                              }`}>
                                {invoice.status}
                              </span>
                              <div className="text-right min-w-[110px]">
                                <p className={`text-[15px] font-bold ${selectedInvoiceId === invoice.id ? 'text-white' : 'text-black'}`}>
                                  <span className={`${selectedInvoiceId === invoice.id ? 'text-gray-500' : 'text-gray-400'} mr-1 font-normal`}>₱</span>
                                  {parseFloat(invoice.amount).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* Right Column: Dynamic Detail View */}
                <div className="flex-1">
                   {selectedInvoice ? (
                     <div className="bg-[#18181b] rounded-[45px] p-10 h-full flex flex-col border border-white/5 text-white">
                       {/* Detail Header */}
                       <div className="flex items-start justify-between mb-14">
                         <div className="flex space-x-14">
                           <div>
                             <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4">Invoice details</p>
                             <div className="flex items-center space-x-4">
                               <h2 className="text-[32px] font-bold text-gray-500"># <span className="text-white">{selectedInvoice.invoice_number}</span></h2>
                               <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(selectedInvoice.status)}`}>
                                 {selectedInvoice.status}
                               </span>
                             </div>
                           </div>
                           <div>
                             <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4">Client ID</p>
                             <div className="flex items-center space-x-3">
                               <span className="text-[28px] font-bold tracking-tight">{selectedInvoice.client_key_id || 'N/A'}</span>
                             </div>
                           </div>
                           <div>
                             <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-4">Due Date</p>
                             <div>
                               <p className="text-[14px] font-bold">{formatDate(selectedInvoice.due_date)}</p>
                               <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                                 {selectedInvoice.is_overdue ? 'OVERDUE' : 'ON TIME'}
                               </p>
                             </div>
                           </div>
                         </div>
                       </div>

                       {/* Invoice Items */}
                       <div className="grid grid-cols-4 gap-4 mb-10">
                         {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                           selectedInvoice.items.map((item: any, i: number) => (
                             <div key={i} className="bg-[#27272a]/30 p-7 rounded-[32px] border border-white/5 hover:bg-[#27272a]/50 transition-all group cursor-pointer">
                               <div className="flex justify-between items-start mb-10">
                                 <p className="text-[22px] font-bold tracking-tight">
                                   <span className="text-gray-500 text-[15px] mr-1 font-normal leading-none">₱</span>
                                   {(parseFloat(item.quantity) * parseFloat(item.rate)).toLocaleString()}
                                 </p>
                                 <ArrowUpRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                               </div>
                               <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{item.description}</p>
                             </div>
                           ))
                         ) : (
                           <div className="col-span-4 text-center py-8">
                             <p className="text-gray-500">No items available</p>
                           </div>
                         )}
                       </div>

                       {/* Summary Footer */}
                       <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-10">
                         <div className="flex space-x-16">
                           <div>
                             <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">Sub Total</p>
                             <p className="text-[26px] font-bold tracking-tight text-white">
                                <span className="text-gray-500 text-lg mr-1 font-normal">₱</span>
                                {parseFloat(selectedInvoice.subtotal || selectedInvoice.amount).toLocaleString()}
                             </p>
                           </div>
                           <div>
                             <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">Total</p>
                             <p className="text-[26px] font-bold tracking-tight text-white">
                                <span className="text-gray-500 text-lg mr-1 font-normal">₱</span>
                                {parseFloat(selectedInvoice.amount).toLocaleString()}
                             </p>
                           </div>
                           <div>
                             <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-3">Balance Due</p>
                             <p className="text-[26px] font-bold tracking-tight text-[#bfff07]">
                                <span className="text-[#bfff07]/60 text-lg mr-1 font-normal">₱</span>
                                {parseFloat(selectedInvoice.amount).toLocaleString()}
                             </p>
                           </div>
                         </div>
                         
                         <div className="flex items-center space-x-4">
                           <button className="p-4.5 bg-[#27272a] rounded-[22px] text-gray-400 hover:text-white transition-all border border-white/5">
                             <Paperclip size={20} />
                           </button>
                           <button className="p-4.5 bg-[#27272a] rounded-[22px] text-gray-400 hover:text-white transition-all border border-white/5">
                             <Calendar size={20} />
                           </button>
                           <Link href={`/admin/invoices/${selectedInvoice.id}`}>
                             <button className="bg-[#bfff07] text-black px-10 py-4.5 rounded-full font-bold text-sm shadow-[0_10px_30px_-5px_rgba(191,255,7,0.3)] hover:brightness-110 transition-all active:scale-95">
                               View Details
                             </button>
                           </Link>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="bg-[#18181b] rounded-[45px] p-10 h-full flex items-center justify-center border border-white/5">
                       <div className="text-center">
                         <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                         <p className="text-gray-500">Select an invoice to view details</p>
                       </div>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Pagination */}
          {invoices.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: invoices.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/admin/invoices?page=${page}`}
                  className={`px-5 py-3 border rounded-full transition-all font-bold text-sm ${
                    page === invoices.current_page
                      ? "bg-[#bfff07] text-black border-[#bfff07] shadow-[0_10px_30px_-5px_rgba(191,255,7,0.3)]"
                      : "bg-[#18181b] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}