<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'client_key_id',
        'title',
        'total',
        'status',
        'valid_until',
        'scope',
        'terms',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'valid_until' => 'date',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function clientKey(): BelongsTo
    {
        return $this->belongsTo(ClientKey::class, 'client_key_id', 'key');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProposalItem::class);
    }

    public function contract(): HasOne
    {
        return $this->hasOne(Contract::class);
    }
}
