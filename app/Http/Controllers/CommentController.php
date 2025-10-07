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
        // Load comments with user info and reactions
        $comments = $task->comments()
            ->with('user:id,name,role', 'reactions')
            ->get(['id', 'user_id', 'message', 'created_at', 'parent_id', 'pinned', 'highlighted'])
            ->map(function($comment) {
                // Map reactions to a simple emoji => count array
                $comment->reactions = $comment->reactions
                    ->groupBy('emoji')
                    ->map(fn($group) => $group->count())
                    ->toArray();
                return $comment;
            });

        return response()->json($comments);
    }

    // Store new comment (Admin or Client)
    public function store(Request $request, $taskId)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $task = Task::findOrFail($taskId);

        $commentData = [
            'message' => $request->message,
            'parent_id' => $request->parent_id,
            'pinned' => false,
            'highlighted' => false,
        ];

        // Case 1: Logged-in Admin
        if (auth()->check()) {
            $commentData['user_id'] = auth()->id();
        }
        // Case 2: Client with client_key_id
        elseif ($request->has('client_key_id')) {
            $commentData['client_key_id'] = $request->client_key_id;
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $comment = $task->comments()->create($commentData);
        $comment->load('user');
        
        // Map reactions for consistency
        $comment->reactions = [];

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
        // Admins can delete any comment
        if (auth()->check() && auth()->user()->role === 'admin') {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully']);
        }

        // Clients can delete their own comments
        if (
            (auth()->check() && $comment->user_id === auth()->id())
            || ($request->has('client_key_id') && $comment->client_key_id === $request->client_key_id)
        ) {
            $comment->delete();
            return response()->json(['message' => 'Comment deleted successfully']);
        }

        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Pin/Unpin a comment (Admin only)
    public function togglePin(Comment $comment)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->update(['pinned' => !$comment->pinned]);
        $comment->load('user:id,name,role', 'reactions');
        
        // Map reactions
        $comment->reactions = $comment->reactions
            ->groupBy('emoji')
            ->map(fn($group) => $group->count())
            ->toArray();

        return response()->json($comment);
    }

    // Highlight/Unhighlight a comment (Admin only)
    public function toggleHighlight(Comment $comment)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->update(['highlighted' => !$comment->highlighted]);
        $comment->load('user:id,name,role', 'reactions');
        
        // Map reactions
        $comment->reactions = $comment->reactions
            ->groupBy('emoji')
            ->map(fn($group) => $group->count())
            ->toArray();

        return response()->json($comment);
    }

    // Add reaction to a comment
    public function addReaction(Request $request, Comment $comment)
    {
        $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        $userId = null;
        $clientKeyId = null;

        // Determine user
        if (auth()->check()) {
            $userId = auth()->id();
        } elseif ($request->has('client_key_id')) {
            $clientKeyId = $request->client_key_id;
        } else {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check if user already reacted with this emoji
        $existingReaction = $comment->reactions()
            ->where('emoji', $request->emoji)
            ->where(function ($query) use ($userId, $clientKeyId) {
                if ($userId) {
                    $query->where('user_id', $userId);
                } else {
                    $query->where('client_key_id', $clientKeyId);
                }
            })
            ->first();

        if ($existingReaction) {
            // Remove reaction if already exists (toggle behavior)
            $existingReaction->delete();
        } else {
            // Add new reaction
            $comment->reactions()->create([
                'emoji' => $request->emoji,
                'user_id' => $userId,
                'client_key_id' => $clientKeyId,
            ]);
        }

        // Return updated reactions count
        $reactions = $comment->reactions()
            ->get()
            ->groupBy('emoji')
            ->map(fn($group) => $group->count())
            ->toArray();

        return response()->json($reactions);
    }
}