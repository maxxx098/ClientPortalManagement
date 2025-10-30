<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_key_id',
        'invoice_number',
        'amount',
        'status',
        'due_date',
        'notes',
    ];

    public function clientKey()
    {
        return $this->belongsTo(ClientKey::class);
    }
}
