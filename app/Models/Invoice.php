<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'client_key_id',
        'invoice_number',
        'invoice_date',
        'due_date',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount',
        'amount',
        'status',
        'notes',
        'internal_notes',
        'payment_terms',
        'items', 
    ];

    protected $casts = [
        'items' => 'array',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function clientKey()
    {
        return $this->belongsTo(ClientKey::class);
    }

    public function payments()
    {
        return $this->hasMany(Payments::class);
    }

    public function getIsOverdueAttribute()
    {
        return $this->status === 'unpaid' && $this->due_date < now();
    }
    public function items ()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}