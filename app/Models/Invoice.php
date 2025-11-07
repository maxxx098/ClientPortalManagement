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
        'invoice_date',
        'amount',
        'status',
        'due_date',
        'overdue_notice_sent',
        'paid_date',
        'overdue_date',
        'notes',
    ];

    public function clientKey()
    {
        return $this->belongsTo(ClientKey::class);
    }
    
}
