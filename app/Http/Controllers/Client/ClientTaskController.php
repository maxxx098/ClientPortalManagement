<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\ClientKey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
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

            // Add this: Get the project for validation
            $project = Project::where('client_key_id', $clientKeyId)->first();

            return Inertia::render('tasks/index', [
                'tasks' => $tasks,
                'client_key_id' => $clientKeyId,
                'clients' => [],
                'project' => $project ? ['due_date' => $project->due_date, 'started' => $project->started_at] : null, 
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
            'started_at' => 'nullable|date',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'voice_message' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done',
        ]);

        if ($request->filled('voice_message')) {
        $audio = $request->input('voice_message');

        // remove base64 header
        $audio = preg_replace('/^data:audio\/\w+;base64,/', '', $audio);
        $audio = base64_decode($audio);

        $fileName = 'voice_' . time() . '.webm';
        $filePath = 'tasks/voice/' . $fileName;

        Storage::disk('public')->put($filePath, $audio);

        $validated['voice_message'] = $filePath;
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
            'started_at' => $validated['started_at'] ?? null,
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
    if ($request->has('status') && count($request->all()) === 2) {
        $validated = $request->validate([
            'status' => 'required|in:todo,in_progress,done',
        ]);
        
        $task->update(['status' => $validated['status']]);
        
        return redirect()->back()->with('success', 'Task status updated successfully.');
    } else {
        // Get the project's due date for validation
        $project = Project::where('client_key_id', $request->client_key_id)->first();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client_key_id' => 'required|exists:client_keys,key',
            'voice_message' => 'nullable|string',
            'due_date' => [
                'nullable',
                'date',
                $project && $project->due_date 
                    ? 'before_or_equal:' . $project->due_date 
                    : 'nullable'
            ],
            'status' => 'nullable|in:todo,in_progress,done',
            'file' => 'nullable|file|max:10240',
            'progress_status' => 'nullable|in:on_track,at_risk,off_track',
        ], [
            'due_date.before_or_equal' => 'Task due date cannot be after the project due date (' . ($project ? $project->due_date : '') . ')',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? $task->status,
            'due_date' => $validated['due_date'] ?? $task->due_date,
            'client_key_id' => $validated['client_key_id'],
        ];

        // ADD THIS: Process voice message the same way as in store()
        if ($request->filled('voice_message')) {
            $audio = $request->input('voice_message');

            // Only process if it's a new recording (contains base64 data)
            if (strpos($audio, 'base64,') !== false) {
                // Remove base64 header
                $audio = preg_replace('/^data:audio\/\w+;base64,/', '', $audio);
                $audio = base64_decode($audio);

                $fileName = 'voice_' . time() . '.webm';
                $filePath = 'tasks/voice/' . $fileName;

                Storage::disk('public')->put($filePath, $audio);

                $updateData['voice_message'] = $filePath;
            } else {
                // If it's already a path (not base64), keep it as is
                $updateData['voice_message'] = $audio;
            }
        }

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('tasks', 'public');
            $updateData['file'] = $filePath;
        }

        $task->update($updateData);

        \Log::info('Admin TaskController Update: Task updated', [
            'task_id' => $task->id,
            'title' => $task->title
        ]);

        $referer = $request->headers->get('referer');
        if ($referer && strpos($referer, '/projects/') !== false) {
            return back()->with('success', 'Task updated successfully.');
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