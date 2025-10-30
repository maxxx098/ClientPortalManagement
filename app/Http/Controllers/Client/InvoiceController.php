<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
     public function index()
    {
        $client = Auth::user()->client;
        $invoices = Invoice::where('client_id', $client->id)->latest()->get();

        return Inertia::render('Client/Invoices/Index', [
            'invoices' => $invoices,
        ]);
    }

    public function show(Invoice $invoice)
    {
        $this->authorize('view', $invoice); // optional policy
        return Inertia::render('Client/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }
}
