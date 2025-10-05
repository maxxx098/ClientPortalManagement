<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $tasks = Task::where('client_key_id', $request->client_key_id)->get();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
        ]);
    }

   public function store(Request $request)
{
    $user = auth()->user();

    $rules = [
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'client_key_id' => 'required|exists:client_keys,id',
    ];

    // Override client_key_id validation for non-admin users
    if ($user->role !== 'admin') {
        $request->merge(['client_key_id' => $user->client_key_id]);
    }

    $request->validate($rules);

    Task::create([
        'title' => $request->title,
        'description' => $request->description,
        'status' => 'todo',
        'client_key_id' => $user->role === 'admin'
            ? $request->client_key_id
            : $user->client_key_id,
    ]);

    return response()->json(['message' => 'Task created successfully']);
}

   public function update(Request $request, Task $task)
{
    $request->validate([
        'status' => 'required|in:todo,in_progress,done',
    ]);

    $task->update(['status' => $request->status]);

    return response()->json(['message' => 'Status updated']);
}

}
