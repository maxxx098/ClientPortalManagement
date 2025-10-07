<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CommentReaction;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'message',
        'commentable_id',
        'commentable_type',
        'message', 
        'parent_id', 
        'pinned', 
        'highlighted'
    ];

        protected $casts = [
        'pinned' => 'boolean',
        'highlighted' => 'boolean',
    ];
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reactions() {
    return $this->hasMany(CommentReaction::class);
    }
    
       public function task()
    {
        return $this->belongsTo(Task::class);
    }
        public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }
}
