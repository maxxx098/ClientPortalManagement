import React from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  Calendar,
  DollarSign
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

export default function ClientInvoiceShow({ invoice, clientKey, payments = [], items = [] }: Props) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!isFinite(num)) return "₱0.00";
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

  const handleDownloadPdf = () => {
    window.open(`/client/invoices/${invoice.id}/pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusVariant = (status: string): "default" | "outline" | "secondary" => {
    if (status === "overdue") return "default";
    if (status === "paid" || status === "partially_paid") return "secondary";
    return "outline";
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-16">
        <main className="mx-auto w-full max-w-[1100px] px-8 py-8">

          {/* Header Actions */}
          <div className="mb-8 flex items-center justify-between border-b border-border pb-6 print:hidden">
            <Link href="/client/invoices">
              <Button variant="outline" size="sm" className="gap-2 rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider">
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-2 rounded-none border-border font-mono text-xs font-bold uppercase tracking-wider">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Main Invoice Content */}
            <div className="space-y-3 lg:col-span-2">
              <div className="border border-border p-8 print:border-0">
                {/* Invoice Header */}
                <div className="mb-6 flex items-start justify-between border-b border-border pb-6">
                  <div>
                    <h1 className="mb-3 text-4xl font-semibold tracking-tight text-foreground">Invoice</h1>
                    <div className="space-y-1 font-mono text-xs text-muted-foreground">
                      <p><span className="uppercase tracking-wider">Invoice #</span> {invoice.invoice_number}</p>
                      <p><span className="uppercase tracking-wider">Date</span> {formatDate(invoice.invoice_date)}</p>
                      <p><span className="uppercase tracking-wider">Due</span> {formatDate(invoice.due_date)}</p>
                      {invoice.payment_terms && (
                        <p><span className="uppercase tracking-wider">Terms</span> {invoice.payment_terms}</p>
                      )}
                    </div>
                  </div>

                  <Badge variant={getStatusVariant(invoice.status)} className="rounded-none font-mono text-[10px] uppercase tracking-wider">
                    {invoice.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Client Information */}
                {clientKey && (
                  <div className="mb-8">
                    <h2 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Billed To
                    </h2>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{clientKey.name}</p>
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
                        <p className="mt-1 text-sm text-muted-foreground">{clientKey.address}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Invoice Items */}
                <div className="mb-8 border border-border">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                        <th className="px-4 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                        <th className="px-4 py-3 text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rate</th>
                        <th className="px-4 py-3 text-right font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items && items.length > 0 ? (
                        items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 text-sm text-foreground">{item.description}</td>
                            <td className="px-4 py-4 text-center font-mono text-sm text-muted-foreground">{item.quantity}</td>
                            <td className="px-4 py-4 text-right font-mono text-sm text-muted-foreground">{formatCurrency(item.rate)}</td>
                            <td className="px-4 py-4 text-right font-mono text-sm font-semibold text-foreground">
                              {formatCurrency(item.quantity * item.rate)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-4 text-sm text-foreground" colSpan={3}>Service Fee</td>
                          <td className="px-4 py-4 text-right font-mono text-sm font-semibold text-foreground">
                            {formatCurrency(invoice.subtotal || invoice.amount)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2 border border-border p-5">
                    <div className="flex justify-between font-mono text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums text-foreground">{formatCurrency(invoice.subtotal || invoice.amount)}</span>
                    </div>
                    {invoice.tax_rate > 0 && (
                      <div className="flex justify-between font-mono text-sm text-muted-foreground">
                        <span>Tax ({invoice.tax_rate}%)</span>
                        <span className="tabular-nums text-foreground">{formatCurrency(invoice.tax_amount)}</span>
                      </div>
                    )}
                    {parseFloat(String(invoice.discount)) > 0 && (
                      <div className="flex justify-between font-mono text-sm text-muted-foreground">
                        <span>Discount</span>
                        <span className="tabular-nums text-foreground">-{formatCurrency(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span className="font-mono tabular-nums">{formatCurrency(invoice.amount)}</span>
                    </div>
                    {payments.length > 0 && (
                      <>
                        <div className="flex justify-between font-mono text-sm text-muted-foreground">
                          <span>Paid</span>
                          <span className="tabular-nums">-{formatCurrency(totalPaid)}</span>
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
                    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Notes
                    </h3>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{invoice.notes}</p>
                  </div>
                )}

                {/* Footer Info */}
                <div className="mt-8 space-y-1 border-t border-border pt-6 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <p>Created {formatDateTime(invoice.created_at)}</p>
                  {balance > 0 && invoice.status !== 'cancelled' && (
                    <p className="mt-2 font-semibold text-foreground">
                      Please submit payment by {formatDate(invoice.due_date)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 print:hidden">
              {/* Payment Summary */}
              <div className="border border-border bg-foreground p-6 text-background">
                <h2 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-background/60">
                  <DollarSign className="h-4 w-4" />
                  Payment Summary
                </h2>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-background/60">Total Amount</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-background/60">Amount Paid</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-background/20 pt-2 text-base">
                    <span className="font-semibold">Balance Due</span>
                    <span className="font-bold tabular-nums">{formatCurrency(balance)}</span>
                  </div>
                </div>

                {balance > 0 && invoice.status !== 'cancelled' && (
                  <div className="mt-4 border border-background/20 p-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-background/80">
                      Due by {formatDate(invoice.due_date)}
                    </p>
                  </div>
                )}

                {invoice.status === 'paid' && (
                  <div className="mt-4 border border-background/20 p-3">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider">
                      Paid in full
                    </p>
                  </div>
                )}
              </div>

              {/* Payment History */}
              {payments.length > 0 && (
                <div className="border border-border p-6">
                  <h2 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-foreground">
                    <FileText className="h-4 w-4" />
                    Payment History
                  </h2>
                  <div className="space-y-0">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border-b border-border py-3 last:border-b-0 last:pb-0">
                        <div className="mb-1 flex items-start justify-between">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {formatCurrency(payment.amount)}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                            {formatDate(payment.payment_date)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {payment.reference_number && (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            Ref: {payment.reference_number}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice Info */}
              <div className="border border-border p-6">
                <h2 className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-foreground">
                  <Calendar className="h-4 w-4" />
                  Invoice Information
                </h2>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="uppercase tracking-wider text-muted-foreground">Invoice Date</span>
                    <span className="font-semibold text-foreground">{formatDate(invoice.invoice_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="uppercase tracking-wider text-muted-foreground">Due Date</span>
                    <span className="font-semibold text-foreground">{formatDate(invoice.due_date)}</span>
                  </div>
                  {invoice.payment_terms && (
                    <div className="flex justify-between">
                      <span className="uppercase tracking-wider text-muted-foreground">Terms</span>
                      <span className="font-semibold text-foreground">{invoice.payment_terms}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-wider text-muted-foreground">Status</span>
                    <Badge variant={getStatusVariant(invoice.status)} className="rounded-none font-mono text-[9px] uppercase">
                      {invoice.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="border border-border p-6">
                <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-foreground">Need Help?</h2>
                <p className="text-sm text-muted-foreground">
                  If you have any questions about this invoice, please contact us.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}