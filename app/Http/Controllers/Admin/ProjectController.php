<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of ALL projects (Admin only).
     */
    public function index(Request $request)
    {
        $projects = Project::with('clientKey:key,id')
            ->latest()
            ->get();

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'isAdmin' => true,
        ]);
    }

    /**
     * Show a single project (Admin can view any project).
     */
    public function show(Request $request, Project $project)
    {
        return Inertia::render('admin/projects/show', [
            'project' => $project,
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
            'due_date' => ['nullable', 'date|after_or_equal:start_date'],
            'priority' => ['required', 'in:low,medium,high'],
            'client_key_id' => ['required', 'string', 'exists:client_keys,key'],
        ]);

        Project::create($validated);

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully.');
    }

    /**
     * Update the specified project (Admin can update any project).
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:planned,in_progress,on_hold,completed'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date|after_or_equal:start_date'],
            'priority' => ['required', 'in:low,medium,high'],
            'client_key_id' => ['required', 'string', 'exists:client_keys,key'],
        ]);

        $project->update($validated);

        return redirect()->route('admin.projects.show', $project)
            ->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project (Admin only).
     */
    public function destroy(Request $request, Project $project)
    {
        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully.');
    }
}