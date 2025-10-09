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
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:todo,in_progress,done',
            'file' => 'nullable|file|max:10240', // Max 10MB
        ]);
         
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('tasks', 'public');
            $validated['file'] = $filePath;
        }

        \Log::info('Admin TaskController Store: Creating task', [
            'client_key_id' => $validated['client_key_id'],
            'title' => $validated['title']
        ]);

        Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'todo',
            'due_date' => $validated['due_date'] ?? null,
            'client_key_id' => $validated['client_key_id'],
            'file' => $validated['file'] ?? null,
        ]);

        \Log::info('Admin TaskController Store: Task created successfully', [
            'title' => $validated['title']
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
                'due_date' => 'nullable|date',
                'status' => 'nullable|in:todo,in_progress,done',
                'file' => 'nullable|file|max:10240', // Max 10MB
            ]);
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('tasks', 'public');
                $validated['file'] = $filePath;
            }

            $task->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? $task->status,
                'due_date' => $validated['due_date'] ?? $task->due_date,
                'client_key_id' => $validated['client_key_id'],
                'file' => $validated['file'] ?? $task->file,
            ]);

            if (isset($validated['file'])) {
                \Log::info('Admin TaskController Update: Task updated with new file', [
                    'task_id' => $task->id,
                    'file' => $validated['file']
                ]);
            } else {
                \Log::info('Admin TaskController Update: Task updated', [
                    'task_id' => $task->id,
                    'title' => $validated['title']
                ]);
            }

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

    /**
     * remove the attached file from the specified task
     */
    public function removeFile(Task $task)
    {
        if ($task->file) {
            \Storage::disk('public')->delete($task->file);
            $task->update(['file' => null]);
        }

        return redirect()->back()->with('success', 'File removed successfully.');
    }
}