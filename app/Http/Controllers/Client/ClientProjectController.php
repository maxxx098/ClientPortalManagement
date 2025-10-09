<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientProjectController extends Controller
{
    /**
     * Display a listing of client's projects.
     */
    public function index(Request $request)
    {
        $clientKeyUUID = $request->session()->get('client_key_id');

        if (!$clientKeyUUID) {
            abort(403, 'No client key found in session.');
        }

        $projects = Project::where('client_key_id', $clientKeyUUID)
            ->latest()
            ->get();

        return Inertia::render('client/projects/index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Show a single project for the client.
     */
    public function show(Request $request, Project $project)
    {
        $clientKeyUUID = $request->session()->get('client_key_id');

        // Ensure client can only view their own projects
        if ($project->client_key_id !== $clientKeyUUID) {
            abort(403, 'Unauthorized access to this project.');
        }

        return Inertia::render('client/projects/show', [
            'project' => $project,
        ]);
    }

    /**
     * Show the form for creating a new project (optional for clients).
     */
    public function create(Request $request)
    {
        // Optional: Allow clients to create their own projects
        return Inertia::render('client/projects/create');
    }

    /**
     * Store a newly created project for the client.
     */
    public function store(Request $request)
    {
        $clientKeyUUID = $request->session()->get('client_key_id');

        if (!$clientKeyUUID) {
            abort(403, 'No client key found in session.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
            'start_date' => ['nullable', 'date'],
            'file' => ['nullable', 'file', 'max:10240'], // Max 10MB
            'due_date' => ['nullable', 'date|after_or_equal:start_date'],
            'priority' => ['required', 'in:low,medium,high'],
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('project_files', 'public');
            $validated['file'] = $path;
        }

        // Force the client's UUID
        $validated['client_key_id'] = $clientKeyUUID;

        Project::create($validated);

        return redirect()->route('client.projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Show the form for editing a project.
     */
    public function edit(Request $request, Project $project)
    {
        $clientKeyUUID = $request->session()->get('client_key_id');

        // Ensure client can only edit their own projects
        if ($project->client_key_id !== $clientKeyUUID) {
            abort(403, 'Unauthorized access to this project.');
        }

        return Inertia::render('client/projects/edit', [
            'project' => $project,
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project)
    {
        $clientKeyUUID = $request->session()->get('client_key_id');

        // Ensure client can only update their own projects
        if ($project->client_key_id !== $clientKeyUUID) {
            abort(403, 'Unauthorized access to this project.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date|after_or_equal:start_date'],
            'priority' => ['required', 'in:low,medium,high'],
        ]);

        // Client cannot change the client_key_id
        $project->update($validated);

        return redirect()->route('client.projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project.
     * Optional: You can disable this if clients shouldn't delete projects
     */
    public function destroy(Request $request, Project $project)
    {
        $clientKeyUUID = $request->session()->get('client_key_id');

        // Ensure client can only delete their own projects
        if ($project->client_key_id !== $clientKeyUUID) {
            abort(403, 'Unauthorized access to this project.');
        }

        // Optional: Completely prevent clients from deleting
        // abort(403, 'Clients cannot delete projects.');

        $project->delete();

        return redirect()->route('client.projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}