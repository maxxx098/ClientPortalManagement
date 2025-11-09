<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClientKey;
use App\Models\Invoice;
use App\Models\Payments;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use App\Mail\InvoiceMail;
use Carbon\Carbon;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with(['clientKey', 'payments']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('client_key')) {
            $client = ClientKey::where('key', $request->client_key)->first();
            if ($client) {
                $query->where('client_key_id', $client->id);
            }
        }

        if ($request->filled('date_from')) {
            $query->whereDate('invoice_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('invoice_date', '<=', $request->date_to);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }

        // Check for overdue invoices and update status
        Invoice::where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->update(['status' => 'overdue']);

        $invoices = $query->latest('invoice_date')->paginate(20);

        // Calculate statistics
        $stats = [
            'total_revenue' => Invoice::where('status', 'paid')->sum('amount'),
            'pending_amount' => Invoice::where('status', 'unpaid')->sum('amount'),
            'overdue_amount' => Invoice::where('status', 'overdue')->sum('amount'),
            'total_invoices' => Invoice::count(),
            'paid_invoices' => Invoice::where('status', 'paid')->count(),
            'unpaid_invoices' => Invoice::where('status', 'unpaid')->count(),
            'overdue_invoices' => Invoice::where('status', 'overdue')->count(),
            'this_month_revenue' => Invoice::where('status', 'paid')
                ->whereMonth('invoice_date', now()->month)
                ->whereYear('invoice_date', now()->year)
                ->sum('amount'),
        ];

        // Monthly revenue chart data (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyRevenue[] = [
                'month' => $date->format('M Y'),
                'revenue' => Invoice::where('status', 'paid')
                    ->whereMonth('invoice_date', $date->month)
                    ->whereYear('invoice_date', $date->year)
                    ->sum('amount'),
            ];
        }

        $clients = ClientKey::select('id', 'key')
            ->orderBy('key')
            ->get();

        return Inertia::render('admin/invoices/index', [
            'invoices' => $invoices,
            'clients' => $clients,
            'stats' => $stats,
            'monthlyRevenue' => $monthlyRevenue,
            'filters' => $request->only(['status', 'client_key', 'date_from', 'date_to', 'amount_min', 'amount_max']),
        ]);
    }

    public function store(Request $request, $clientKey)
    {
        $data = $request->validate([
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:invoice_date',
            'status' => 'required|string|in:unpaid,paid,overdue,cancelled',
            'notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.rate' => 'required|numeric|min:0',
        ]);

        $client = ClientKey::where('key', $clientKey)->firstOrFail();

        // Calculate totals
        $subtotal = 0;
        foreach ($data['items'] as $item) {
            $subtotal += $item['quantity'] * $item['rate'];
        }

        $taxAmount = $subtotal * (($data['tax_rate'] ?? 0) / 100);
        $total = $subtotal + $taxAmount - ($data['discount'] ?? 0);

        $invoice = Invoice::create([
            'client_key_id' => $client->id,
            'invoice_number' => 'INV-' . strtoupper(uniqid()),
            'invoice_date' => $data['invoice_date'],
            'due_date' => $data['due_date'],
            'subtotal' => $subtotal,
            'tax_rate' => $data['tax_rate'] ?? 0,
            'tax_amount' => $taxAmount,
            'discount' => $data['discount'] ?? 0,
            'amount' => $total,
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
            'internal_notes' => $data['internal_notes'] ?? null,
            'payment_terms' => $data['payment_terms'] ?? 'Net 30',
            'items' => $data['items'], // Store items as JSON
        ]);

        return redirect()->route('admin.invoices.index')
            ->with('success', 'Invoice created successfully.');
    }
    public function show(Invoice $invoice)
    {
        return Inertia::render('admin/invoices/show', [
            'invoice' => $invoice,
            'isAdmin' => true,
            'clientKey' => $invoice->clientKey,
            'payments' => $invoice->payments,
            'items' => $invoice->items,
        ]);
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();

        return redirect()->route('admin.invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'invoice_ids' => 'required|array',
            'status' => 'required|string|in:unpaid,paid,overdue,cancelled',
        ]);

        Invoice::whereIn('id', $request->invoice_ids)
            ->update(['status' => $request->status]);

        return back()->with('success', 'Invoices updated successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'invoice_ids' => 'required|array',
        ]);

        Invoice::whereIn('id', $request->invoice_ids)->delete();

        return back()->with('success', 'Invoices deleted successfully.');
    }

    public function downloadPdf(Invoice $invoice)
    {
        $invoice->load(['clientKey', 'items', 'payments']);
        
        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        
        return $pdf->download($invoice->invoice_number . '.pdf');
    }

    public function sendEmail(Invoice $invoice)
    {
        $invoice->load(['clientKey', 'items']);

        if (!$invoice->clientKey->email) {
            return back()->with('error', 'Client email not found.');
        }

        Mail::to($invoice->clientKey->email)->send(new InvoiceMail($invoice));

        return back()->with('success', 'Invoice sent successfully.');
    }

    public function export(Request $request)
    {
        $query = Invoice::with(['clientKey', 'payments']);

        // Apply same filters as index
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('invoice_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('invoice_date', '<=', $request->date_to);
        }

        $invoices = $query->get();

        $filename = 'invoices_' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($invoices) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Invoice #', 'Client', 'Date', 'Due Date', 'Amount', 'Paid', 'Status']);

            foreach ($invoices as $invoice) {
                fputcsv($file, [
                    $invoice->invoice_number,
                    $invoice->clientKey->name ?? 'N/A',
                    $invoice->invoice_date,
                    $invoice->due_date,
                    $invoice->amount,
                    $invoice->payments->sum('amount'),
                    $invoice->status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function recordPayment(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data['invoice_id'] = $invoice->id;

        Payments::create($data);

        // Update invoice status if fully paid
        $totalPaid = $invoice->payments()->sum('amount');
        
        if ($totalPaid >= $invoice->amount) {
            $invoice->update(['status' => 'paid']);
        } elseif ($totalPaid > 0 && $invoice->status === 'unpaid') {
            $invoice->update(['status' => 'partially_paid']);
        }

        return back()->with('success', 'Payment recorded successfully.');
    }

    public function duplicate(Invoice $invoice)
    {
        $newInvoice = $invoice->replicate();
        $newInvoice->invoice_number = 'INV-' . strtoupper(uniqid());
        $newInvoice->invoice_date = now();
        $newInvoice->due_date = now()->addDays(30);
        $newInvoice->status = 'unpaid';

        // If items are stored as a JSON/array on the invoice model, copy them directly
        $newInvoice->items = $invoice->items ?? [];
        $newInvoice->save();

        return redirect()->route('admin.invoices.show', $newInvoice)
            ->with('success', 'Invoice duplicated successfully.');
    }

     public function updateStatus(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'invoice_date' => 'required|date',
            'due_date' => 'required|date',
            'status' => 'required|in:unpaid,paid,overdue,cancelled',
            'notes' => 'nullable|string',
            'internal_notes' => 'nullable|string',
        ]);

        // Auto-create payment when marking as paid
        if ($validated['status'] === 'paid' && $invoice->status !== 'paid') {
            $totalPaid = $invoice->payments()->sum('amount');
            $balance = $invoice->amount - $totalPaid;
            
            if ($balance > 0) {
                $invoice->payments()->create([
                    'amount' => $balance,
                    'payment_date' => now(),
                    'payment_method' => 'bank_transfer',
                    'notes' => 'Automatically recorded when invoice marked as paid',
                ]);
            }
        }

        $invoice->update($validated);

        return redirect()->back()->with('success', 'Invoice updated successfully');
    }

}