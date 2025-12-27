<?php

namespace App\Models;

use App\Models\ClientKey;
use App\Models\Comment;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'due_date',
        'started_at',
        'status',
        'voice_message',
        'progress_status',
        'file',
        'client_key_id',
    ];

    public function clientkey()
    {
       return $this->belongsTo(ClientKey::class, 'client_key_id', 'key');
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }


}