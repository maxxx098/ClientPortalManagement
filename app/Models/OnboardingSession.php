<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OnboardingSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'client_key_id',
        'status',
        'started_at',
        'completed_at',
        'kickoff_date',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'kickoff_date' => 'datetime',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function clientKey(): BelongsTo
    {
        return $this->belongsTo(ClientKey::class, 'client_key_id', 'key');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(OnboardingStep::class)->orderBy('order_index');
    }
}
