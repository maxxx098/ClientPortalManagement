import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DollarSign
} from "lucide-react";
import AppLayout from "@/layouts/app-layout";
import invoices from "@/routes/admin/invoices/index";
import { index } from "@/routes/admin/projects";

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
    
    // Warn user if marking as paid with outstanding balance
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

  return (
    <AppLayout>
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between print:hidden">
            <Link
              href={
                isAdmin ? "/admin/invoices"
                  : "/admin/invoices"
              }
            >
              <Button variant="ghost" size="sm" className="rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>

            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="rounded-xl">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  {clientKey?.email && (
                    <Button variant="outline" size="sm" onClick={handleSendEmail} className="rounded-xl">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleDuplicate} className="rounded-xl">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Invoice</DialogTitle>
                        <DialogDescription>
                          Update invoice details
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Invoice Date</label>
                          <Input
                            type="date"
                            value={editForm.invoice_date}
                            onChange={(e) => setEditForm({ ...editForm, invoice_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Due Date</label>
                          <Input
                            type="date"
                            value={editForm.due_date}
                            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Status</label>
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md bg-background"
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
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Internal Notes</label>
                          <Textarea
                            value={editForm.internal_notes}
                            onChange={(e) => setEditForm({ ...editForm, internal_notes: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdate}>Save Changes</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700 hover:border-red-300 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Invoice Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="print:shadow-none print:border-0">
                <CardContent className="p-8">
                  {/* Invoice Header */}
                  <div className="border-b pb-6 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">Invoice #:</span>{" "}
                            {invoice.invoice_number}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(invoice.invoice_date)}
                          </p>
                          <p>
                            <span className="font-medium">Due Date:</span>{" "}
                            {formatDate(invoice.due_date)}
                          </p>
                          {invoice.payment_terms && (
                            <p>
                              <span className="font-medium">Terms:</span>{" "}
                              {invoice.payment_terms}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className={`${getStatusColor(invoice.status)} border text-xs px-3 py-1`}>
                          {invoice.status.toUpperCase().replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  {clientKey && (
                    <div className="mb-8">
                      <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                        BILLED TO
                      </h2>
                      <div>
                        <p className="text-lg font-semibold">{clientKey.name}</p>
                        {clientKey.company && (
                          <p className="text-sm text-muted-foreground">{clientKey.company}</p>
                        )}
                        {clientKey.email && (
                          <p className="text-sm text-muted-foreground">{clientKey.email}</p>
                        )}
                        {clientKey.phone && (
                          <p className="text-sm text-muted-foreground">{clientKey.phone}</p>
                        )}
                        {clientKey.address && (
                          <p className="text-sm text-muted-foreground mt-1">{clientKey.address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Invoice Items */}
                  <div className="mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 text-sm font-semibold">Description</th>
                          <th className="text-center py-3 text-sm font-semibold">Qty</th>
                          <th className="text-right py-3 text-sm font-semibold">Rate</th>
                          <th className="text-right py-3 text-sm font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items && items.length > 0 ? (
                          items.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-4">{item.description}</td>
                              <td className="py-4 text-center">{item.quantity}</td>
                              <td className="py-4 text-right">{formatCurrency(item.rate)}</td>
                              <td className="py-4 text-right font-semibold">
                                {formatCurrency(item.quantity * item.rate)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="py-4" colSpan={3}>Service Fee</td>
                            <td className="py-4 text-right font-semibold">
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
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(invoice.subtotal || invoice.amount)}</span>
                      </div>
                      {invoice.tax_rate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Tax ({invoice.tax_rate}%):</span>
                          <span>{formatCurrency(invoice.tax_amount)}</span>
                        </div>
                      )}
                      {parseFloat(String(invoice.discount)) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Discount:</span>
                          <span>-{formatCurrency(invoice.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(invoice.amount)}</span>
                      </div>
                      {payments.length > 0 && (
                        <>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Paid:</span>
                            <span>-{formatCurrency(totalPaid)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Balance:</span>
                            <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
                              {formatCurrency(balance)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {invoice.notes && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        NOTES
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  )}

                  {/* Internal Notes (Admin Only) */}
                  {isAdmin && invoice.internal_notes && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg print:hidden">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        INTERNAL NOTES (Private)
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">{invoice.internal_notes}</p>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="mt-8 pt-6 border-t text-xs text-muted-foreground space-y-1">
                    <p>Created: {formatDateTime(invoice.created_at)}</p>
                    <p>Last Updated: {formatDateTime(invoice.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 print:hidden">
              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="font-semibold">{formatCurrency(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="font-medium">Balance Due:</span>
                      <span className={`font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>

                  {isAdmin && balance > 0 && (
                    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full rounded-xl">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Record Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Payment</DialogTitle>
                          <DialogDescription>
                            Record a payment for this invoice
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Amount *</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Balance: {formatCurrency(balance)}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Payment Date *</label>
                            <Input
                              type="date"
                              value={paymentForm.payment_date}
                              onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Payment Method *</label>
                            <select
                              value={paymentForm.payment_method}
                              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                              className="w-full px-3 py-2 border rounded-md bg-background"
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
                            <label className="block text-sm font-medium mb-2">Reference Number</label>
                            <Input
                              type="text"
                              placeholder="Transaction ID or Check #"
                              value={paymentForm.reference_number}
                              onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <Textarea
                              placeholder="Payment notes..."
                              value={paymentForm.notes}
                              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleRecordPayment}>Record Payment</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
              {payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div key={payment.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(payment.payment_date)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          {payment.reference_number && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {payment.reference_number}
                            </p>
                          )}
                          {payment.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {payment.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Invoice Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Invoice Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span className="font-medium">{formatDate(invoice.invoice_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className="font-medium">{formatDate(invoice.due_date)}</span>
                  </div>
                  {invoice.payment_terms && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Terms:</span>
                      <span className="font-medium">{invoice.payment_terms}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`${getStatusColor(invoice.status)} border text-xs`}>
                      {invoice.status.toUpperCase().replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}