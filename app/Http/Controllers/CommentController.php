<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    // Get all comments for a task
   public function index(Task $task)
{
    $comments = $task->comments()->with('user:id,name,role')->get(['id', 'user_id', 'message', 'created_at']);
    return response()->json($comments);
}


    //  Store new comment (Admin or Client)
    public function store(Request $request, $taskId)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $task = Task::findOrFail($taskId);

        $commentData = ['message' => $request->message];

        // Case 1: Logged-in Admin
        if (auth()->check()) {
            $commentData['user_id'] = auth()->id();
        }
        // Case 2: Client — pass `client_key_id` from frontend
        elseif ($request->has('client_key_id')) {
            $commentData['client_key_id'] = $request->client_key_id;
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $commentData['reactions'] = [];

        $comment = $task->comments()->create($commentData);

        $comment->load('user');

        return response()->json($comment, 201);
    }

    // Update a comment
   public function update(Request $request, Comment $comment)
{
    $request->validate([
        'message' => 'required|string|max:2000',
    ]);

    // Admins can edit all comments
    if (auth()->check() && auth()->user()->role === 'admin') {
        $comment->update(['message' => $request->message]);
        return response()->json($comment->load('user:id,name'));
    }

    // Clients can only edit their own comments
    if (
        (auth()->check() && $comment->user_id === auth()->id())
        || ($request->has('client_key_id') && $comment->client_key_id === $request->client_key_id)
    ) {
        $comment->update(['message' => $request->message]);
        return response()->json($comment->load('user:id,name'));
    }

    return response()->json(['error' => 'Unauthorized'], 403);
}

    // Delete a comment
    public function destroy(Request $request, Comment $comment)
    {
        //  Admins can delete any comment
        if (auth()->check() && auth()->user()->role === 'admin') {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully']);
        }

        //  Clients can delete their own comments
        if (
            auth()->check() && $comment->user_id === auth()->id()
            || ($request->has('client_key_id') && $comment->client_key_id === $request->client_key_id)
        ) {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully']);
        }

        return response()->json(['error' => 'Unauthorized'], 403);
    }
}
