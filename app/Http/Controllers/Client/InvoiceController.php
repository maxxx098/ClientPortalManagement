<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientKey;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    /**
     * Get the client's key UUID from session
     */
    private function getClientKeyId(Request $request)
    {
        return $request->session()->get('client_key_id');
    }

    /**
     * Get the ClientKey model from UUID
     */
    private function getClientKey(Request $request)
    {
        $clientKeyUUID = $this->getClientKeyId($request);
        
        if (!$clientKeyUUID) {
            abort(403, 'No client key found in session.');
        }

        $clientKey = ClientKey::where('key', $clientKeyUUID)->first();
        
        if (!$clientKey) {
            abort(403, 'Invalid client key.');
        }

        return $clientKey;
    }

    public function index(Request $request)
    {
        $clientKey = $this->getClientKey($request);

        $query = Invoice::where('client_key_id', $clientKey->id)
            ->with(['payments']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
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

        $invoices = $query->latest('invoice_date')->paginate(20);

        // Calculate statistics
        $stats = [
            'total_invoiced' => Invoice::where('client_key_id', $clientKey->id)->sum('amount'),
            'total_paid' => Invoice::where('client_key_id', $clientKey->id)
                ->where('status', 'paid')
                ->sum('amount'),
            'pending_amount' => Invoice::where('client_key_id', $clientKey->id)
                ->where('status', 'unpaid')
                ->sum('amount'),
            'overdue_amount' => Invoice::where('client_key_id', $clientKey->id)
                ->where('status', 'overdue')
                ->sum('amount'),
            'total_invoices' => Invoice::where('client_key_id', $clientKey->id)->count(),
            'paid_invoices' => Invoice::where('client_key_id', $clientKey->id)
                ->where('status', 'paid')
                ->count(),
            'unpaid_invoices' => Invoice::where('client_key_id', $clientKey->id)
                ->where('status', 'unpaid')
                ->count(),
            'overdue_invoices' => Invoice::where('client_key_id', $clientKey->id)
                ->where('status', 'overdue')
                ->count(),
        ];

        // Monthly invoice data (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'invoiced' => Invoice::where('client_key_id', $clientKey->id)
                    ->whereMonth('invoice_date', $date->month)
                    ->whereYear('invoice_date', $date->year)
                    ->sum('amount'),
                'paid' => Invoice::where('client_key_id', $clientKey->id)
                    ->where('status', 'paid')
                    ->whereMonth('invoice_date', $date->month)
                    ->whereYear('invoice_date', $date->year)
                    ->sum('amount'),
            ];
        }

        return Inertia::render('client/invoices/index', [
            'invoices' => $invoices,
            'stats' => $stats,
            'monthlyData' => $monthlyData,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'amount_min', 'amount_max']),
            'clientInfo' => [
                'name' => $clientKey->name,
                'email' => $clientKey->email,
                'company' => $clientKey->company ?? null,
            ],
        ]);
    }

    public function show(Request $request, Invoice $invoice)
    {
        $clientKey = $this->getClientKey($request);
        
        // Verify this invoice belongs to the authenticated client
        if ($invoice->client_key_id != $clientKey->id) {
            abort(403, 'Unauthorized access to this invoice.');
        }

        $invoice->load(['clientKey', 'payments']);

        return Inertia::render('client/invoices/show', [
            'invoice' => $invoice,
            'clientKey' => $invoice->clientKey,
            'payments' => $invoice->payments,
            'items' => $invoice->items,
            'isAdmin' => false,
        ]);
    }

    public function downloadPdf(Request $request, Invoice $invoice)
    {
        $clientKey = $this->getClientKey($request);
        
        // Verify this invoice belongs to the authenticated client
        if ($invoice->client_key_id != $clientKey->id) {
            abort(403, 'Unauthorized access to this invoice.');
        }

        $invoice->load(['clientKey', 'items', 'payments']);
        
        $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
        
        return $pdf->download($invoice->invoice_number . '.pdf');
    }

    public function export(Request $request)
    {
        $clientKey = $this->getClientKey($request);
        
        $query = Invoice::where('client_key_id', $clientKey->id)
            ->with(['payments']);

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

        $filename = 'my_invoices_' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($invoices) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Invoice #', 'Date', 'Due Date', 'Amount', 'Paid', 'Balance', 'Status']);

            foreach ($invoices as $invoice) {
                $totalPaid = $invoice->payments->sum('amount');
                $balance = $invoice->amount - $totalPaid;
                
                fputcsv($file, [
                    $invoice->invoice_number,
                    $invoice->invoice_date,
                    $invoice->due_date,
                    $invoice->amount,
                    $totalPaid,
                    $balance,
                    $invoice->status,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}