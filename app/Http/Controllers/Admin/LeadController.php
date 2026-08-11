<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ClientPortalInvite;
use App\Models\ClientKey;
use App\Models\Lead;
use App\Models\OnboardingSession;
use App\Models\OnboardingStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LeadController extends Controller
{
    public function index()
    {
        if (! Schema::hasTable('leads')) {
            return Inertia::render('admin/leads/index', [
                'leads' => [],
            ]);
        }

        $leads = Lead::latest()->get();

        return Inertia::render('admin/leads/index', [
            'leads' => $leads,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/leads/create');
    }

    public function show(Lead $lead)
    {
        $lead->load(['proposals' => fn ($query) => $query->latest()]);

        return Inertia::render('admin/leads/show', [
            'lead' => $lead,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'source' => ['nullable', 'string', 'max:255'],
            'budget' => ['nullable', 'string', 'max:255'],
            'urgency' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $lead = Lead::create($validated);

        return redirect()->route('admin.leads.show', $lead)
            ->with('success', 'Lead created successfully.');
    }

    public function update(Request $request, Lead $lead)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string'],
            'budget' => ['nullable', 'string', 'max:255'],
            'urgency' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $lead->update($validated);

        return back()->with('success', 'Lead updated successfully.');
    }

    public function convertToClient(Lead $lead)
    {
        // Log the lead ID for debugging purposes
        \Log::info('convertToClient hit', ['lead_id' => $lead->id]);
        $clientKey = ClientKey::firstOrCreate([
            'key' => (string) Str::uuid(),
        ], [
            'locked' => false,
            'used' => false,
            'name' => $lead->company_name ?: $lead->name,
            'email' => $lead->email,
        ]);

        $lead->status = 'won';
        $lead->save();

        if ($lead->email) {
            Mail::to($lead->email)->send(
                new ClientPortalInvite(
                    $clientKey,
                    $lead->company_name ?: $lead->name,
                )
            );
        }

        $onboarding = OnboardingSession::firstOrCreate([
            'lead_id' => $lead->id,
        ], [
            'client_key_id' => $clientKey->key,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        $defaultSteps = [
            ['title' => 'Welcome email sent', 'slug' => 'welcome_email_sent', 'description' => 'Introduce the onboarding flow and next steps.', 'order_index' => 1],
            ['title' => 'Project brief received', 'slug' => 'project_brief_received', 'description' => 'Collect goals, timeline, and overall scope.', 'order_index' => 2],
            ['title' => 'Brand and assets shared', 'slug' => 'brand_assets_shared', 'description' => 'Gather logos, references, and key brand materials.', 'order_index' => 3],
            ['title' => 'Kickoff call scheduled', 'slug' => 'kickoff_call_scheduled', 'description' => 'Set the initial project kickoff and communication plan.', 'order_index' => 4],
            ['title' => 'Contract signed', 'slug' => 'contract_signed', 'description' => 'Confirm the proposal or agreement is approved.', 'order_index' => 5],
            ['title' => 'Project launched', 'slug' => 'project_launched', 'description' => 'Create the project and begin execution.', 'order_index' => 6],
        ];

        foreach ($defaultSteps as $step) {
            $onboarding->steps()->firstOrCreate([
                'slug' => $step['slug'],
            ], [
                'title' => $step['title'],
                'description' => $step['description'],
                'status' => 'pending',
                'required' => true,
                'order_index' => $step['order_index'],
            ]);
        }

        return redirect()->route('admin.leads.show', $lead)
            ->with('success', 'Lead converted into a client onboarding workflow.');
    }
}
