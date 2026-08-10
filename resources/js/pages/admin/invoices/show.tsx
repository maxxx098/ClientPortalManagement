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
  ArrowLeft,
  Printer,
  Download,
  Trash2,
  Edit,
  Mail,
  Copy,
  CreditCard,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";

type ClientKey = {
  id: number;
  key: string;
  name: string;
  email?: string;
  company?: string;
  address?: string;
  phone?: string;
};

type Payment = {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
};

type InvoiceItem = {
  description: string;
  quantity: number;
  rate: number;
};

type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number | string;
  subtotal: number | string;
  tax_rate: number;
  tax_amount: number | string;
  discount: number | string;
  status: string;
  notes?: string;
  internal_notes?: string;
  payment_terms?: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
};

type Props = {
  invoice: Invoice;
  clientKey: ClientKey;
  payments: Payment[];
  items: InvoiceItem[];
  isAdmin?: boolean;
};

export default function InvoiceShow({ invoice, clientKey, payments = [], items = [], isAdmin = false }: Props) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    status: invoice.status,
    notes: invoice.notes || "",
    internal_notes: invoice.internal_notes || "",
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: "bank_transfer",
    reference_number: "",
    notes: "",
  });

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
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(String(payment.amount)), 0);
  const balance = parseFloat(String(invoice.amount)) - totalPaid;

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      router.delete(`/admin/invoices/${invoice.id}`, {
        onSuccess: () => {
          router.visit(`/admin/invoices`);
        },
      });
    }
  };

  const handleUpdate = () => {
    const wasUnpaid = invoice.status !== 'paid';
    const nowPaid = editForm.status === 'paid';
    const hasBalance = balance > 0;

    if (wasUnpaid && nowPaid && hasBalance) {
      if (!confirm(`This will mark the invoice as paid and automatically record a payment of ${formatCurrency(balance)}. Continue?`)) {
        return;
      }
    }

    router.post(`/admin/invoices/${invoice.id}`, {
      ...editForm,
      _method: 'PUT'
    }, {
      onSuccess: () => {
        setShowEditDialog(false);
      },
      onError: (errors) => {
        console.error('Update errors:', errors);
        alert('Error updating invoice. Check console for details.');
      },
    });
  };

  const handleRecordPayment = () => {
    router.post(`/admin/invoices/${invoice.id}/payments`, paymentForm, {
      onSuccess: () => {
        setPaymentForm({
          amount: "",
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: "bank_transfer",
          reference_number: "",
          notes: "",
        });
        setShowPaymentDialog(false);
      },
    });
  };

  const handleDownloadPdf = () => {
    window.open(`/admin/invoices/${invoice.id}/pdf`, '_blank');
  };

  const handleSendEmail = () => {
    if (confirm(`Send invoice to ${clientKey.email}?`)) {
      router.post(`/admin/invoices/${invoice.id}/send`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleDuplicate = () => {
    if (confirm("Create a duplicate of this invoice?")) {
      router.post(`/admin/invoices/${invoice.id}/duplicate`, {}, {
        onSuccess: () => {
          // Will redirect to the new invoice
        },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusVariant = (status: string): "default" | "outline" | "secondary" => {
    if (status === "overdue") return "default";
    if (status === "paid") return "secondary";
    return "outline";
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between print:hidden">
            <Link href="/admin/invoices">
              <Button variant="ghost" size="sm" className="gap-2 rounded-none">
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>

            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-none border-border">
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2 rounded-none border-border">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  {clientKey?.email && (
                    <Button variant="outline" size="sm" onClick={handleSendEmail} className="gap-2 rounded-none border-border">
                      <Mail className="h-4 w-4" />
                      Send Email
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleDuplicate} className="gap-2 rounded-none border-border">
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 rounded-none border-border">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-none border-border">
                      <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                        <DialogDescription>Update invoice details</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Invoice Date
                          </label>
                          <Input
                            type="date"
                            value={editForm.invoice_date}
                            onChange={(e) => setEditForm({ ...editForm, invoice_date: e.target.value })}
                            className="rounded-none border-border"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Due Date
                          </label>
                          <Input
                            type="date"
                            value={editForm.due_date}
                            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                            className="rounded-none border-border"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Status
                          </label>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Notes
                          </label>
                          <Textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            rows={3}
                            className="rounded-none border-border"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Internal Notes
                          </label>
                          <Textarea
                            value={editForm.internal_notes}
                            onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                            rows={3}
                            className="rounded-none border-border"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowEditDialog(false)} className="rounded-none border-border">
                            Cancel
                          </Button>
                          <Button onClick={handleUpdate} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2 rounded-none border-border text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Invoice Content */}
            <div className="space-y-6 lg:col-span-2">
              <div className="border border-border p-8 print:border-0">
                {/* Invoice Header */}
                <div className="mb-6 border-b border-border pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="mb-3 text-3xl font-semibold tracking-tight text-foreground">Invoice</h1>
                      <div className="space-y-1 font-mono text-xs text-muted-foreground">
                        <p>
                          <span className="uppercase tracking-wider">No.</span> {invoice.invoice_number}
                        </p>
                        <p>
                          <span className="uppercase tracking-wider">Date</span> {formatDate(invoice.invoice_date)}
                        </p>
                        <p>
                          <span className="uppercase tracking-wider">Due</span> {formatDate(invoice.due_date)}
                        </p>
                        {invoice.payment_terms && (
                          <p>
                            <span className="uppercase tracking-wider">Terms</span> {invoice.payment_terms}
                          </p>
                        )}
                      </div>
                    </div>

                    <Badge variant={getStatusVariant(invoice.status)} className="rounded-none font-mono text-[10px] uppercase tracking-wider">
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Client Information */}
                {clientKey && (
                  <div className="mb-8">
                    <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      Billed To
                    </h2>
                    <div>
                      <p className="text-base font-semibold text-foreground">{clientKey.name}</p>
                      {clientKey.company && <p className="text-sm text-muted-foreground">{clientKey.company}</p>}
                      {clientKey.email && <p className="text-sm text-muted-foreground">{clientKey.email}</p>}
                      {clientKey.phone && <p className="text-sm text-muted-foreground">{clientKey.phone}</p>}
                      {clientKey.address && <p className="mt-1 text-sm text-muted-foreground">{clientKey.address}</p>}
                    </div>
                  </div>
                )}

                {/* Invoice Items */}
                <div className="mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Description
                        </th>
                        <th className="py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Qty
                        </th>
                        <th className="py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Rate
                        </th>
                        <th className="py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items && items.length > 0 ? (
                        items.map((item, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-4 text-sm text-foreground">{item.description}</td>
                            <td className="py-4 text-center font-mono text-sm tabular-nums text-foreground">{item.quantity}</td>
                            <td className="py-4 text-right font-mono text-sm tabular-nums text-foreground">{formatCurrency(item.rate)}</td>
                            <td className="py-4 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                              {formatCurrency(item.quantity * item.rate)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-border">
                          <td className="py-4 text-sm text-foreground" colSpan={3}>Service Fee</td>
                          <td className="py-4 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(invoice.subtotal || invoice.amount)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-mono tabular-nums">{formatCurrency(invoice.subtotal || invoice.amount)}</span>
                    </div>
                    {invoice.tax_rate > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax ({invoice.tax_rate}%)</span>
                        <span className="font-mono tabular-nums">{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    {parseFloat(String(invoice.discount)) > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Discount</span>
                        <span className="font-mono tabular-nums">-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span className="font-mono tabular-nums">{formatCurrency(invoice.amount)}</span>
                    </div>
                    {payments.length > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Paid</span>
                          <span className="font-mono tabular-nums">-{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold text-foreground">
                          <span>Balance</span>
                          <span className="font-mono tabular-nums">{formatCurrency(balance)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                  <div className="mt-8 border-t border-border pt-6">
                    <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Notes</h3>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{invoice.notes}</p>
                  </div>
                )}

                {/* Internal Notes (Admin Only) */}
                {isAdmin && invoice.internal_notes && (
                  <div className="mt-6 border border-border p-4 print:hidden">
                    <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                      Internal Notes (Private)
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{invoice.internal_notes}</p>
                  </div>
                )}

                {/* Footer Info */}
                <div className="mt-8 space-y-1 border-t border-border pt-6 font-mono text-[10px] text-muted-foreground">
                  <p>Created {formatDateTime(invoice.created_at)}</p>
                  <p>Last Updated {formatDateTime(invoice.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 print:hidden">
              {/* Payment Summary */}
              <div className="border border-border p-6">
                <h3 className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-mono font-semibold tabular-nums text-foreground">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-mono font-semibold tabular-nums text-foreground">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-sm">
                    <span className="font-medium text-foreground">Balance Due</span>
                    <span className="font-mono font-bold tabular-nums text-foreground">{formatCurrency(balance)}</span>
                  </div>
                </div>

                {isAdmin && balance > 0 && (
                  <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogTrigger asChild>
                      <Button className="mt-4 w-full gap-2 rounded-none bg-foreground text-background hover:bg-foreground/90">
                        <CreditCard className="h-4 w-4" />
                        Record Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-none border-border">
                      <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>Record a payment for this invoice</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Amount *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="rounded-none border-border"
                          />
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            Balance: {formatCurrency(balance)}
                          </p>
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Payment Date *
                          </label>
                          <Input
                            type="date"
                            value={paymentForm.payment_date}
                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                            className="rounded-none border-border"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Payment Method *
                          </label>
                          <select
                            value={paymentForm.payment_method}
                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                            className="w-full rounded-none border border-border bg-background px-3 py-2 text-sm text-foreground"
                          >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            Reference Number
                          </label>
                          <Input
                            type="text"
                            placeholder="Transaction ID or Check #"
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
                            placeholder="Payment notes..."
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            rows={3}
                            className="rounded-none border-border"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="rounded-none border-border">
                            Cancel
                          </Button>
                          <Button onClick={handleRecordPayment} className="rounded-none bg-foreground text-background hover:bg-foreground/90">
                            Record Payment
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="border border-border p-6">
                  <h3 className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Payment History
                  </h3>
                  <div className="flex flex-col">
                    {payments.map((payment, i) => (
                      <div key={payment.id} className="border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="flex items-center gap-2 font-mono text-sm font-semibold tabular-nums text-foreground">
                            <span className="text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                            {formatCurrency(payment.amount)}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">{formatDate(payment.payment_date)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {payment.reference_number && (
                          <p className="font-mono text-[10px] text-muted-foreground">Ref: {payment.reference_number}</p>
                        )}
                        {payment.notes && <p className="mt-1 text-xs text-muted-foreground">{payment.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice Info */}
              <div className="border border-border p-6">
                <h3 className="mb-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Invoice Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date</span>
                    <span className="font-medium text-foreground">{formatDate(invoice.invoice_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium text-foreground">{formatDate(invoice.due_date)}</span>
                  </div>
                  {invoice.payment_terms && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Terms</span>
                      <span className="font-medium text-foreground">{invoice.payment_terms}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={getStatusVariant(invoice.status)} className="rounded-none font-mono text-[10px] uppercase tracking-wider">
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}