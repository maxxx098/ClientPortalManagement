<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClientKey;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index($clientKey)
    {
        // Find client by UUID key instead of ID
        $client = ClientKey::where('key', $clientKey)
            ->with('invoices')
            ->firstOrFail();

        return Inertia::render('admin/invoices/index', [
            'client' => $client,
            'invoices' => $client->invoices,
        ]);
    }

    public function all()
    {
        $invoices = Invoice::with('client')
            ->latest('invoice_date')
            ->paginate(20);

        // Get all clients - just id and key
        $clients = ClientKey::select('id', 'key')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/invoices/all', [
            'invoices' => $invoices,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request, $clientKey)
    {
        $data = $request->validate([
            'invoice_date' => 'required|date',
            'amount' => 'required|numeric',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        // Find client by UUID key
        $client = ClientKey::where('key', $clientKey)->firstOrFail();

        $data['client_key_id'] = $client->id;
        $data['invoice_number'] = 'INV-' . strtoupper(uniqid());

        Invoice::create($data);

        return redirect()->route('admin.invoices.all')
            ->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('admin/invoices/show', [
            'invoice' => $invoice->load('client'),
        ]);
    }
}