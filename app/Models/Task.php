<?php

namespace App\Models;

use App\Models\ClientKey;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'status',
        'client_key_id',
    ];

    public function clientkey()
    {
       return $this->belongsTo(ClientKey::class, 'client_key_id', 'key');
    }
}
