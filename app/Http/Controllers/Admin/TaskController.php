<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\ClientKey;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display a listing of all tasks (Admin view)
     */
    public function index()
    {
        $tasks = Task::with('clientKey:id,key')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all client keys for dropdown
        $clients = ClientKey::select('id', 'key')->get();

        \Log::info('Admin TaskController Index:', [
            'tasks_count' => $tasks->count(),
            'clients_count' => $clients->count()
        ]);

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'clients' => $clients,
        ]);
    }

    /**
     * Store a newly created task
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client_key_id' => 'required|exists:client_keys,key',
            'status' => 'nullable|in:todo,in_progress,done',
        ]);

        \Log::info('Admin TaskController Store: Creating task', [
            'client_key_id' => $validated['client_key_id'],
            'title' => $validated['title']
        ]);

        Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'todo',
            'client_key_id' => $validated['client_key_id'],
        ]);

        return redirect()->route('admin.tasks.index')
            ->with('success', 'Task created successfully.');
    }

    /**
     * Show the form for editing the specified task
     */
    public function edit(Task $task)
    {
        $task->load('clientKey:id,key');
        
        // Get all client keys for dropdown
        $clients = ClientKey::select('id', 'key')->get();

        return Inertia::render('admin/tasks/edit', [
            'task' => $task,
            'clients' => $clients,
        ]);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, Task $task)
    {
        // Check if it's a status update (from drag-and-drop) or full update (from edit form)
        if ($request->has('status') && count($request->all()) === 1) {
            // Status update only
            $validated = $request->validate([
                'status' => 'required|in:todo,in_progress,done',
            ]);
            
            $task->update(['status' => $validated['status']]);
            
            return redirect()->back()->with('success', 'Task status updated successfully.');
        } else {
            // Full task update
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'client_key_id' => 'required|exists:client_keys,key',
                'status' => 'nullable|in:todo,in_progress,done',
            ]);

            $task->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? $task->status,
                'client_key_id' => $validated['client_key_id'],
            ]);

            return redirect()->route('admin.tasks.index')
                ->with('success', 'Task updated successfully.');
        }
    }

    /**
     * Remove the specified task
     */
    public function destroy(Task $task)
    {
        // Admins can delete any task, no authorization check needed
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully.');
    }
}