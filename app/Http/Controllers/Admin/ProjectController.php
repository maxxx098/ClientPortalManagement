<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of ALL projects (Admin only).
     */
        public function index(Request $request)
        {
            $hasClientKeys = \App\Models\ClientKey::exists();

            $projects = [];
            $availableClientKeys = collect();

            if ($hasClientKeys) {
                $projects = Project::with('clientKey:key,id')
                    ->withCount('tasks')
                    ->latest()
                    ->get()
                    ->map(function ($project) {
                        $totalTasks = $project->tasks()->count();
                        $completedTasks = $project->tasks()->where('status', 'done')->count();
                        $project->progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
                        $project->tasks_count = $totalTasks;
                        return $project;
                    });

                $usedClientKeyIds = Project::pluck('client_key_id')->toArray();
                $availableClientKeys = \App\Models\ClientKey::whereNotIn('key', $usedClientKeyIds)
                    ->select('id', 'key')
                    ->get();
            }

            return Inertia::render('admin/projects/index', [
                'projects' => $projects,
                'availableClientKeys' => $availableClientKeys,
                'hasClientKeys' => $hasClientKeys,
                'isAdmin' => true,
            ]);
        }

    /**
     * Show a single project (Admin can view any project).
     */
    public function show(Request $request, Project $project)
    {
        // Load tasks related to this project via client_key_id
        $tasks = Task::where('client_key_id', $project->client_key_id)
            ->with('clientKey:id,key')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate progress based on completed tasks
        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'done')->count();
        $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        $project->tasks_count = $totalTasks;
        $project->progress = $progress;

        return Inertia::render('admin/projects/show', [
            'project' => $project,
            'tasks' => $tasks,
            'isAdmin' => true,
        ]);
    }

    /**
     * Show the form for editing a project.
     */
    public function edit(Request $request, Project $project)
    {
        return Inertia::render('admin/projects/edit', [
            'project' => $project,
        ]);
    }

    /**
     * Store a newly created project (Admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'priority' => ['required', 'in:low,medium,high'],
            'file' => ['nullable', 'file', 'max:10240'], // Max 10MB
            'client_key_id' => ['required', 'string', 'exists:client_keys,key'],
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('project_files', 'public');
            $validated['file'] = '/storage/' . $path;
        }

        Project::create($validated);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Update the specified project (Admin can update any project).
     */
    public function update(Request $request, Project $project)
    {
        // Check if only status is being updated (quick status change)
        if ($request->has('status') && count($request->all()) <= 2) {
            $validated = $request->validate([
                'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
            ]);

            $project->update($validated);

            return back()->with('success', 'Project status updated successfully.');
        }

        // Full project update
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'priority' => ['required', 'in:low,medium,high'],
            'file' => ['nullable', 'file', 'max:10240'], // Max 10MB
            'client_key_id' => ['required', 'string', 'exists:client_keys,key'],
        ]);

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($project->file) {
                $oldPath = str_replace('/storage/', '', $project->file);
                \Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('file')->store('project_files', 'public');
            $validated['file'] = '/storage/' . $path;
        }

        $project->update($validated);

        return redirect()->route('admin.projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project (Admin only).
     */
    public function destroy(Request $request, Project $project)
    {
        // Delete associated file if exists
        if ($project->file) {
            $filePath = str_replace('/storage/', '', $project->file);
            \Storage::disk('public')->delete($filePath);
        }

        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully.');
    }

    /**
     * Quick status toggle for projects.
     */
    public function toggleStatus(Request $request, Project $project)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
        ]);

        $project->update(['status' => $validated['status']]);

        return back()->with('success', 'Project status updated to ' . $validated['status']);
    }
}