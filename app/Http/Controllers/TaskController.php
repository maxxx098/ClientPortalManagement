<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\ClientKey;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Get the client_key_id for the current user
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

    public function index(Request $request)
    {
        $user = auth()->user();
        $clientKeyId = $this->getClientKeyId();
        
        // Get tasks based on user role
        if ($user->role === 'admin') {
            $tasks = Task::with('clientKey:id,key')->get();
        } else {
            // For clients, filter by their client_key_id (UUID)
            $tasks = Task::where('client_key_id', $clientKeyId)
                        ->with('clientKey:id,key')
                        ->get();
        }

        // Get clients for admin dropdown
        $clients = [];
        if ($user->role === 'admin') {
            $clients = ClientKey::select('id', 'key')->get();
        }

        \Log::info('TaskController Index:', [
            'user_role' => $user->role,
            'client_key_id' => $clientKeyId,
            'tasks_count' => $tasks->count(),
            'clients_count' => count($clients)
        ]);

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'clients' => $clients,
            'auth' => [
                'user' => [
                    'role' => $user->role,
                    'client_key_id' => $clientKeyId
                ]
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $clientKeyId = $this->getClientKeyId();

        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ];

        // Add client_key_id validation only for admins
        if ($user->role === 'admin') {
            $rules['client_key_id'] = 'required|exists:client_keys,key';
        }

        $validated = $request->validate($rules);

        // Determine client_key_id based on user role
        if ($user->role === 'admin') {
            $finalClientKeyId = $validated['client_key_id'];
        } else {
            // For clients, use their client_key_id from session/email
            $finalClientKeyId = $clientKeyId;
            
            if (!$finalClientKeyId) {
                \Log::error('TaskController Store: No client_key_id found', [
                    'user_email' => $user->email,
                    'user_role' => $user->role,
                    'session_key' => session('client_key_id'),
                ]);
                
                return back()->withErrors([
                    'error' => 'Client key not found. Please log out and log in again.'
                ]);
            }
        }

        \Log::info('TaskController Store: Creating task', [
            'user_role' => $user->role,
            'client_key_id' => $finalClientKeyId,
            'title' => $validated['title']
        ]);

        Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'todo',
            'client_key_id' => $finalClientKeyId,
        ]);

        return redirect()->back()->with('success', 'Task created successfully');
    }

    public function update(Request $request, Task $task)
    {
        $user = auth()->user();
        $clientKeyId = $this->getClientKeyId();
        
        // Check authorization
        if ($user->role !== 'admin' && $task->client_key_id !== $clientKeyId) {
            abort(403, 'Unauthorized');
        }

        // Check if it's a status update (from drag-and-drop) or full update (from edit form)
        if ($request->has('status') && count($request->all()) === 1) {
            // Status update only
            $validated = $request->validate([
                'status' => 'required|in:todo,in_progress,done',
            ]);
            $task->update(['status' => $validated['status']]);
        } else {
            // Full task update
            $rules = [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
            ];

            if ($user->role === 'admin') {
                $rules['client_key_id'] = 'required|exists:client_keys,key';
            }

            $validated = $request->validate($rules);

            $updateData = [
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
            ];

            // Only update client_key_id for admins
            if ($user->role === 'admin' && isset($validated['client_key_id'])) {
                $updateData['client_key_id'] = $validated['client_key_id'];
            }

            $task->update($updateData);
        }

        return redirect()->back()->with('success', 'Task updated successfully');
    }

    public function destroy(Task $task)
    {
        $user = auth()->user();
        $clientKeyId = $this->getClientKeyId();
        
        // Check authorization
        if ($user->role !== 'admin' && $task->client_key_id !== $clientKeyId) {
            abort(403, 'Unauthorized');
        }

        $task->delete();

        return redirect()->back()->with('success', 'Task deleted successfully');
    }
}