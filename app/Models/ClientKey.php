<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientKey extends Model
{
    protected $fillable = [
        'key',
        'used',
        'user_id',
    ];
    /**
     * Get the user that owns the client key.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
