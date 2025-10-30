import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Eye, Trash2, X } from "lucide-react";

type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  amount: number | string;
  status: string;
  notes?: string;
};

type Client = {
  id: number;
  key: string;
  name: string;
};

type Props = {
  client: Client;
  invoices: Invoice[];
};

export default function InvoiceIndex({ client, invoices }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    invoice_date: "",
    amount: "",
    status: "unpaid",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`/admin/clients/${client.key}/invoices`, form, {
      onSuccess: () => {
        setForm({
          invoice_date: "",
          amount: "",
          status: "unpaid",
          notes: "",
        });
        setShowForm(false);
      },
    });
  };

  const handleDelete = (invoiceId: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      router.delete(`/admin/invoices/${invoiceId}`);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalAmount = invoices.reduce((sum, inv) => {
    const amount = typeof inv.amount === "string" ? parseFloat(inv.amount) : inv.amount;
    return sum + amount;
  }, 0);

  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => {
      const amount = typeof inv.amount === "string" ? parseFloat(inv.amount) : inv.amount;
      return sum + amount;
    }, 0);

  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/client-keys">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Invoices for {client.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Client Key: {client.key}
              </p>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Paid Amount</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(paidAmount)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Unpaid Amount</div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(unpaidAmount)}
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Invoices List */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">
              All Invoices ({invoices.length})
            </h2>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No invoices found for this client.</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="mt-4"
              >
                Create First Invoice
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {invoice.invoice_number}
                        </h3>
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
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(invoice.invoice_date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-2 font-semibold text-lg">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </div>
                      </div>

                      {invoice.notes && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <span className="font-medium">Notes:</span> {invoice.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/admin/invoices/${invoice.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}