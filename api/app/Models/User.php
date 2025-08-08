<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'reputation',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'reputation' => 'float',
            'is_admin' => 'boolean',
        ];
    }

    /**
     * Get the OAuth providers for this user.
     */
    public function oauthProviders(): HasMany
    {
        return $this->hasMany(OAuthProvider::class);
    }

    /**
     * Get the feedback created by this user.
     */
    public function feedback(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Get the comments created by this user.
     */
    public function feedbackComments(): HasMany
    {
        return $this->hasMany(FeedbackComment::class);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    /**
     * Get OAuth provider by name.
     */
    public function getOAuthProvider(string $provider): ?OAuthProvider
    {
        return $this->oauthProviders()->where('provider', $provider)->first();
    }

    /**
     * Check if user has OAuth provider.
     */
    public function hasOAuthProvider(string $provider): bool
    {
        return $this->oauthProviders()->where('provider', $provider)->exists();
    }
}
