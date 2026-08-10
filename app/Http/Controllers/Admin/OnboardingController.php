<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClientKey;
use App\Models\OnboardingSession;
use App\Models\OnboardingStep;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function show(ClientKey $client)
    {
        $session = OnboardingSession::where('client_key_id', $client->key)->first();

        if (! $session) {
            abort(404, 'No onboarding session found for this client.');
        }

        $session->load('steps');

        return Inertia::render('admin/onboarding/show', [
            'client' => $client,
            'session' => $session,
        ]);
    }

    public function start(ClientKey $client)
    {
        $session = OnboardingSession::firstOrCreate([
            'client_key_id' => $client->key,
        ], [
            'lead_id' => null,
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        if ($session->steps()->count() === 0) {
            $defaultSteps = [
                ['title' => 'Welcome email sent', 'slug' => 'welcome_email_sent', 'description' => 'Introduce the onboarding process.', 'order_index' => 1],
                ['title' => 'Project brief received', 'slug' => 'project_brief_received', 'description' => 'Collect objectives and timeline.', 'order_index' => 2],
                ['title' => 'Brand assets uploaded', 'slug' => 'brand_assets_uploaded', 'description' => 'Share files and references.', 'order_index' => 3],
                ['title' => 'Kickoff call scheduled', 'slug' => 'kickoff_call_scheduled', 'description' => 'Book the first project conversation.', 'order_index' => 4],
                ['title' => 'Project ready to begin', 'slug' => 'project_ready_to_begin', 'description' => 'Finalize setup and launch the work.', 'order_index' => 5],
            ];

            foreach ($defaultSteps as $step) {
                $session->steps()->create([
                    'title' => $step['title'],
                    'slug' => $step['slug'],
                    'description' => $step['description'],
                    'status' => 'pending',
                    'required' => true,
                    'order_index' => $step['order_index'],
                ]);
            }
        }

        return back()->with('success', 'Onboarding started.');
    }

    public function updateStep(Request $request, OnboardingStep $step)
    {
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $step->update([
            'status' => $validated['status'],
            'completed_at' => $validated['status'] === 'completed' ? now() : null,
        ]);

        return back()->with('success', 'Step updated.');
    }

    public function complete(ClientKey $client)
    {
        $session = OnboardingSession::where('client_key_id', $client->key)->firstOrFail();
        $kickoffDate = $session->kickoff_date ?? now()->addDays(3);

        $session->update([
            'status' => 'completed',
            'completed_at' => now(),
            'kickoff_date' => $kickoffDate,
        ]);

        $projectExists = Project::where('client_key_id', $client->key)->exists();

        if (! $projectExists) {
            $projectName = trim(($client->name ?? 'Client') . ' onboarding project');

            $project = Project::create([
                'name' => $projectName,
                'description' => 'Project created from onboarding workflow.',
                'status' => 'planned',
                'priority' => 'medium',
                'client_key_id' => $client->key,
                'start_date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
            ]);

            Task::create([
                'title' => 'Kickoff call and project briefing',
                'description' => 'Schedule and complete the kickoff session for this client.',
                'status' => 'todo',
                'progress_status' => 'on_track',
                'client_key_id' => $client->key,
            ]);

            Task::create([
                'title' => 'Collect final project assets',
                'description' => 'Confirm all needed files, references, and copy are ready.',
                'status' => 'todo',
                'progress_status' => 'on_track',
                'client_key_id' => $client->key,
            ]);
        }

        return back()->with('success', 'Onboarding completed and project kickoff tasks are ready.');
    }
}
