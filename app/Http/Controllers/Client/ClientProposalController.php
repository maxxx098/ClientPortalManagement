<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientKey;
use App\Models\Proposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientProposalController extends Controller
{
    protected function clientKeyFromRequest(Request $request): ClientKey
    {
        $clientKeyId = $request->session()->get('client_key_id');

        if (! $clientKeyId) {
            abort(403, 'No client key found in session.');
        }

        $clientKey = ClientKey::where('key', $clientKeyId)->first();

        if (! $clientKey) {
            abort(403, 'Invalid client key.');
        }

        return $clientKey;
    }

    public function index(Request $request)
    {
        $clientKey = $this->clientKeyFromRequest($request);

        $proposals = Proposal::with(['lead', 'items'])
            ->where('client_key_id', $clientKey->key)
            ->latest()
            ->get();

        return Inertia::render('client/proposals/index', [
            'proposals' => $proposals,
            'client' => [
                'name' => $clientKey->name,
                'email' => $clientKey->email,
            ],
        ]);
    }

    public function show(Request $request, Proposal $proposal)
    {
        $clientKey = $this->clientKeyFromRequest($request);

        if ($proposal->client_key_id !== $clientKey->key) {
            abort(403, 'Unauthorized access to this proposal.');
        }

        $proposal->load(['lead', 'items', 'contract']);

        return Inertia::render('client/proposals/show', [
            'proposal' => $proposal,
            'lead' => $proposal->lead,
        ]);
    }
}
