import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, Plus, X } from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import { ReactNode } from "react";

type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  amount: number | string;
  status: string;
  client?: {
    id: number;
    name: string;
    key: string;
  };
};

type Client = {
  [x: string]: ReactNode;
  id: number;
  key: string;
};

type Props = {
  invoices: {
    data: Invoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  clients: Client[];
};

export default function AllInvoices({ invoices, clients = [] }: Props) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client_key: "",
    invoice_date: "",
    amount: "",
    status: "unpaid",
    notes: "",
  });

  // Debug: Check if clients are loaded
  console.log('Clients received:', clients);

  const filteredInvoices = invoices.data.filter((invoice) => {
    const searchLower = search.toLowerCase();
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.client?.name?.toLowerCase().includes(searchLower) ||
      invoice.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.client_key) {
      alert("Please select a client");
      return;
    }

    router.post(`/admin/clients/${form.client_key}/invoices`, form, {
      onSuccess: () => {
        setForm({
          client_key: "",
          invoice_date: "",
          amount: "",
          status: "unpaid",
          notes: "",
        });
        setShowForm(false);
      },
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₱${num.toLocaleString("en-PH", { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (date: string) => {
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Invoices</h1>
          <div className="text-sm text-gray-600 mt-1">
            Total: {invoices.total} invoice{invoices.total !== 1 ? "s" : ""}
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Client *
              </label>
              <select
                value={form.client_key}
                onChange={(e) =>
                  setForm({ ...form, client_key: e.target.value })
                }
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
              {clients && clients.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No clients found. Please create a client first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Invoice Date *
                </label>
                <Input
                  type="date"
                  value={form.invoice_date}
                  onChange={(e) =>
                    setForm({ ...form, invoice_date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (₱) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status *
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
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
              <label className="block text-sm font-medium mb-2">Notes</label>
              <Textarea
                placeholder="Add any notes about this invoice..."
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Invoice</Button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by invoice #, client, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className=" border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Invoice #
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Client
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3">
                    {invoice.client ? (
                      <Link
                        href={`/admin/clients/${invoice.client.key}/invoices`}
                        className="text-blue-600 hover:underline"
                      >
                        {invoice.client.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400">No client</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(invoice.invoice_date)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "unpaid"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status?.charAt(0).toUpperCase() + 
                       invoice.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/invoices/${invoice.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {invoices.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: invoices.last_page }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/admin/invoices?page=${page}`}
              className={`px-4 py-2 border rounded ${
                page === invoices.current_page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50"
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