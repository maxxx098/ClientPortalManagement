<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'rate',
        'amount',
        'sort_order',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'rate' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    // Automatically calculate amount when saving
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($item) {
            $item->amount = $item->quantity * $item->rate;
        });
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}