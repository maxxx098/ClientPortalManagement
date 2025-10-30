import React from "react";

type Invoice = {
  id: number | string;
  invoice_number: string;
  invoice_date: string;
  amount: number | string;
  status: "paid" | "pending" | "overdue" | string;
};

interface ClientInvoicesProps {
  invoices: Invoice[];
}

export default function ClientInvoices({ invoices }: ClientInvoicesProps) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Invoices</h1>
      {invoices.length === 0 ? (
        <p>No invoices yet.</p>
      ) : (
        invoices.map((invoice) => (
          <div key={invoice.id} className="border p-4 rounded flex justify-between">
            <div>
              <p>{invoice.invoice_number}</p>
              <p>{invoice.invoice_date}</p>
              <p>₱{invoice.amount}</p>
            </div>
            <span
              className={`px-3 py-1 rounded ${
                invoice.status === "paid"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-400"
              }`}
            >
              {invoice.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
