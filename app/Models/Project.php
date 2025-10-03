<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_key_id',
        'name',
        'description',
        'status',
        'start_date',
        'due_date',
        'priority',
    ];

    public function clientKey()
    {
        return $this->belongsTo(ClientKey::class);
    }
}
