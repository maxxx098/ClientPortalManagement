<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
        'file',
        'client_key_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the client key that owns the project.
     */
    public function clientKey()
    {
        return $this->belongsTo(ClientKey::class, 'client_key_id', 'key');
    }

    /**
     * Get all tasks associated with this project via client_key_id.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'client_key_id', 'client_key_id');
    }

    /**
     * Calculate progress based on completed tasks.
     */
    public function getProgressAttribute()
    {
        $totalTasks = $this->tasks()->count();
        
        if ($totalTasks === 0) {
            return 0;
        }

        $completedTasks = $this->tasks()->where('status', 'done')->count();
        
        return round(($completedTasks / $totalTasks) * 100);
    }
}