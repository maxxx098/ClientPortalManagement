<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientKey extends Model
{
    protected $fillable = [
        'key',
        'locked',
        'locked_at',
        'name',
        'email',
    ];

    protected $casts = [
        'locked' => 'boolean',
        'locked_at' => 'datetime',
    ];

    /**
     * Get the projects for this client key
     */
    public function projects()
    {
        return $this->hasMany(Project::class, 'client_key_id', 'key');
    }

    /**
     * Get the tasks for this client key
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'client_key_id');
    }

    /**
     * Check if the client key is active (not locked)
     */
    public function isActive(): bool
    {
        return !$this->locked;
    }

    /**
     * Scope to get only active (unlocked) client keys
     */
    public function scopeActive($query)
    {
        return $query->where('locked', false)->orWhereNull('locked');
    }

    /**
     * Scope to get only inactive (locked) client keys
     */
    public function scopeInactive($query)
    {
        return $query->where('locked', true);
    }
}