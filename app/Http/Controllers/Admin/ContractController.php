<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractController extends Controller
{
    public function show(Contract $contract)
    {
        $contract->load('proposal');

        return Inertia::render('admin/contracts/show', [
            'contract' => $contract,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proposal_id' => ['required', 'exists:proposals,id'],
            'status' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $contract = Contract::create($validated);

        return redirect()->route('admin.contracts.show', $contract)
            ->with('success', 'Contract created successfully.');
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $contract->update($validated);

        return back()->with('success', 'Contract updated successfully.');
    }

    public function sign(Contract $contract)
    {
        $contract->update([
            'status' => 'signed',
            'signed_at' => now(),
        ]);

        return back()->with('success', 'Contract marked as signed.');
    }
}
