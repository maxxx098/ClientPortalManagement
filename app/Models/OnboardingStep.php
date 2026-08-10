<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'onboarding_session_id',
        'title',
        'slug',
        'description',
        'status',
        'required',
        'due_date',
        'completed_at',
        'order_index',
    ];

    protected $casts = [
        'required' => 'boolean',
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function onboardingSession(): BelongsTo
    {
        return $this->belongsTo(OnboardingSession::class);
    }
}
