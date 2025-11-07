import React from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, Trash2, Edit } from "lucide-react";
import AppLayout from "@/layouts/app-layout";

type Invoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  amount: number | string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: number;
    key: string;
    name: string;
  };
};

type Props = {
  invoice: Invoice;
};

export default function InvoiceShow({ invoice }: Props) {
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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      router.delete(`/admin/invoices/${invoice.id}`, {
        onSuccess: () => {
          router.visit(`/admin/invoices`);
        },
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={
              invoice.client
                ? `/admin/clients/${invoice.client.key}/invoices`
                : "/admin/invoices"
            }
          >
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                alert("Download PDF functionality coming soon!")
              }
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg border shadow-sm p-8 print:shadow-none print:border-0">
          {/* Invoice Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  INVOICE
                </h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Invoice #:</span>{" "}
                    {invoice.invoice_number}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(invoice.invoice_date)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    invoice.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : invoice.status === "unpaid"
                      ? "bg-yellow-100 text-yellow-800"
                      : invoice.status === "overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Client Information */}
          {invoice.client && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                BILLED TO
              </h2>
              <div className="text-gray-900">
                <p className="text-lg font-semibold">{invoice.client.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Client ID: {invoice.client.key}
                </p>
              </div>
            </div>
          )}

          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 text-gray-900">
                    {invoice.notes || "Service Fee"}
                  </td>
                  <td className="py-4 text-right text-lg font-semibold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="border-t-2 border-gray-300">
                <tr>
                  <td className="py-4 text-right font-semibold text-gray-900">
                    TOTAL
                  </td>
                  <td className="py-4 text-right text-2xl font-bold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                NOTES
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Footer Info */}
          <div className="border-t pt-6 text-xs text-gray-500 space-y-1 print:text-gray-600">
            <p>Created: {formatDateTime(invoice.created_at)}</p>
            <p>Last Updated: {formatDateTime(invoice.updated_at)}</p>
          </div>
        </div>

        {/* Payment Instructions (Print Only) */}
        <div className="hidden print:block bg-gray-50 p-6 rounded-lg mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Payment Instructions
          </h3>
          <p className="text-sm text-gray-700">
            Please make payment within 30 days of the invoice date. If you have
            any questions about this invoice, please contact us.
          </p>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}