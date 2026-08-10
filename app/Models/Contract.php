<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'client_key_id',
        'document_path',
        'status',
        'signed_at',
        'expires_at',
        'notes',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function proposal(): BelongsTo
    {
        return $this->belongsTo(Proposal::class);
    }

    public function clientKey(): BelongsTo
    {
        return $this->belongsTo(ClientKey::class, 'client_key_id', 'key');
    }
}
