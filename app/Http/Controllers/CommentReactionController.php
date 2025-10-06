<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentReaction;
use Illuminate\Http\Request;

class CommentReactionController extends Controller
{
    public function react(Request $request, Comment $comment)
    {
        $userId = $request->user()->id;
        $emoji = $request->input('emoji');

        $reaction = CommentReaction::where([
            'comment_id' => $comment->id,
            'user_id' => $userId,
            'emoji' => $emoji
        ])->first();

        if ($reaction) {
            // Remove reaction if already exists (toggle)
            $reaction->delete();
        } else {
            // Add new reaction
            CommentReaction::create([
                'comment_id' => $comment->id,
                'user_id' => $userId,
                'emoji' => $emoji
            ]);
        }

        // Return updated counts
        $reactions = CommentReaction::where('comment_id', $comment->id)
            ->get()
            ->groupBy('emoji')
            ->map(fn($group) => $group->count());

        return response()->json($reactions);
    }
}
