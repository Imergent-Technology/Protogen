<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OAuthProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'provider_data',
    ];

    protected $casts = [
        'provider_data' => 'array',
    ];

    /**
     * Get the user that owns the OAuth provider.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the provider name in a human-readable format.
     */
    public function getProviderNameAttribute()
    {
        return ucfirst($this->provider);
    }
}
