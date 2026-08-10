<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Proposal;
use App\Models\ProposalItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProposalController extends Controller
{
    public function index()
    {
        $proposals = Proposal::with(['lead', 'items'])->latest()->get();

        return Inertia::render('admin/proposals/index', [
            'proposals' => $proposals,
        ]);
    }

    public function create()
    {
        $leads = \App\Models\Lead::select('id', 'name', 'company_name')->orderBy('name')->get();

        return Inertia::render('admin/proposals/create', [
            'leads' => $leads,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => ['required', 'exists:leads,id'],
            'title' => ['required', 'string', 'max:255'],
            'scope' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'valid_until' => ['nullable', 'date'],
            'total' => ['nullable', 'numeric'],
        ]);

        $proposal = Proposal::create($validated);

        if ($request->has('items') && is_array($request->items)) {
            foreach ($request->items as $item) {
                $proposal->items()->create([
                    'title' => $item['title'] ?? 'Service',
                    'description' => $item['description'] ?? null,
                    'quantity' => $item['quantity'] ?? 1,
                    'unit_price' => $item['unit_price'] ?? 0,
                    'subtotal' => ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0),
                ]);
            }
        }

        return redirect()->route('admin.proposals.show', $proposal)
            ->with('success', 'Proposal created successfully.');
    }

    public function show(Proposal $proposal)
    {
        $proposal->load(['lead', 'items']);

        return Inertia::render('admin/proposals/show', [
            'proposal' => $proposal,
        ]);
    }

    public function update(Request $request, Proposal $proposal)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'scope' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'valid_until' => ['nullable', 'date'],
            'total' => ['nullable', 'numeric'],
        ]);

        $proposal->update($validated);

        return back()->with('success', 'Proposal updated successfully.');
    }

    public function send(Proposal $proposal)
    {
        $proposal->update(['status' => 'sent']);

        return back()->with('success', 'Proposal marked as sent.');
    }

    public function accept(Proposal $proposal)
    {
        $proposal->update(['status' => 'accepted']);

        if (! $proposal->contract()->exists()) {
            $proposal->contract()->create([
                'client_key_id' => $proposal->client_key_id,
                'status' => 'draft',
                'notes' => 'Draft contract created from accepted proposal.',
            ]);
        }

        return back()->with('success', 'Proposal accepted.');
    }
}
