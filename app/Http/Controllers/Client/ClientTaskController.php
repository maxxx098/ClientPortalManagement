<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\ClientKey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ClientTaskController extends Controller
{
    /**
     * Get the client's key ID from session 
     */
    private function getClientKeyId()
    {
        $user = auth()->user();
        
        // Method 1: Check session first (most reliable for client login)
        if (session()->has('client_key_id')) {
            return session('client_key_id');
        }
        
        // Method 2: Extract from email if user is a client
        if ($user && str_starts_with($user->email, 'client-')) {
            $emailParts = explode('@', $user->email);
            return str_replace('client-', '', $emailParts[0]);
        }
        
        // Method 3: Check user's client_key_id column (if you have one)
        if ($user && isset($user->client_key_id)) {
            return $user->client_key_id;
        }
        
        return null;
    }

    /**
     * Display a listing of tasks for the authenticated client
     */
   public function index()
    {
        $clientKeyId = $this->getClientKeyId();
        
        if (!$clientKeyId) {
            Log::error('Client key ID not found for user', [
                'user_id' => auth()->id(),
                'user_email' => auth()->user()->email,
            ]);
            
            abort(403, 'Client key not found.');
        }

        $tasks = Task::where('client_key_id', $clientKeyId)
            ->with('clientKey:id,key')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'client_key_id' => $clientKeyId,
            'clients' => [], // Empty array for clients view
        ]);
    }

    /**
     * Store a newly created task for the client
     */
    public function store(Request $request)
    {
        $clientKeyId = $this->getClientKeyId();
        
        if (!$clientKeyId) {
            Log::error('Client TaskController Store: No client_key_id found', [
                'user_email' => auth()->user()->email,
                'session_key' => session('client_key_id'),
            ]);
            
            return back()->withErrors([
                'error' => 'Client key not found. Please log out and log in again.'
            ]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'voice_message' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done',
        ]);

        if ($request->has('voice_message')) {
            $validated['voice_message'] = $request->input('voice_message');
        }

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('tasks', 'public');
            $validated['file'] = $filePath;
        }


        Log::info('Client TaskController Store: Creating task', [
            'client_key_id' => $clientKeyId,
            'title' => $validated['title']
        ]);

        Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'todo',
            'file' => $validated['file'] ?? null,
            'voice_message' => $validated['voice_message'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'client_key_id' => $clientKeyId,
        ]);

        return redirect()->route('client.tasks.index')
            ->with('success', 'Task created successfully.');
    }

    /**
     * Show the form for editing the specified task
     */
    public function edit(Task $task)
    {
        $clientKeyId = $this->getClientKeyId();
        
        if (!$clientKeyId) {
            abort(403, 'Client key not found.');
        }

        // Verify the task belongs to this client
        if ($task->client_key_id !== $clientKeyId) {
            abort(403, 'You do not have permission to edit this task.');
        }

        $task->load('clientKey:id,key');

        return Inertia::render('tasks/edit', [
            'task' => $task,
            'client_key_id' => $clientKeyId,
        ]);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, Task $task)
    {
        $clientKeyId = $this->getClientKeyId();
        
        if (!$clientKeyId) {
            abort(403, 'Client key not found.');
        }

        // Verify the task belongs to this client
        if ($task->client_key_id !== $clientKeyId) {
            abort(403, 'You do not have permission to update this task.');
        }

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
                'status' => 'nullable|in:todo,in_progress,done',
                'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
                'voice_message' => 'nullable|string',
                'due_date' => 'nullable|date',
            ]);

            $task->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'status' => $validated['status'] ?? $task->status,
                'file' => $validated['file'] ?? $task->file,
                'voice_message' => $validated['voice_message'] ?? $task->voice_message,
                'due_date' => $validated['due_date'] ?? $task->due_date,
            ]);

            return redirect()->route('client.tasks.index')
                ->with('success', 'Task updated successfully.');
        }
    }

    /**
     * Remove the specified task
     */
    public function destroy(Task $task)
    {
        $clientKeyId = $this->getClientKeyId();
        
        if (!$clientKeyId) {
            abort(403, 'Client key not found.');
        }

        // Verify the task belongs to this client
        if ($task->client_key_id !== $clientKeyId) {
            abort(403, 'You do not have permission to delete this task.');
        }

        $task->delete();

        return redirect()->route('client.tasks.index')
            ->with('success', 'Task deleted successfully.');
    }
}