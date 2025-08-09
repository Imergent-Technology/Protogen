<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OAuthProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    /**
     * Redirect the user to the OAuth provider.
     */
    public function redirect(Request $request, string $provider)
    {
        $validProviders = ['google', 'facebook', 'instagram'];
        
        if (!in_array($provider, $validProviders)) {
            return response()->json(['error' => 'Invalid provider'], 400);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the OAuth callback.
     */
    public function callback(Request $request, string $provider)
    {
        try {
            // Validate provider
            $validProviders = ['google', 'facebook', 'instagram'];
            if (!in_array($provider, $validProviders)) {
                throw new \Exception('Invalid OAuth provider');
            }

            $socialUser = Socialite::driver($provider)->user();
            
            // Validate social user data
            if (!$socialUser->getEmail()) {
                throw new \Exception('Email is required from OAuth provider');
            }
            
            // Find or create user
            $user = $this->findOrCreateUser($socialUser, $provider);
            
            // Create or update OAuth provider record
            $this->updateOAuthProvider($user, $socialUser, $provider);
            
            // Generate Sanctum token for API access
            $token = $user->createToken('oauth-token', ['*'], now()->addDays(30))->plainTextToken;
            
            // Log successful authentication
            \Log::info("OAuth authentication successful", [
                'provider' => $provider,
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);
            
            // Redirect back to frontend with user data and token
            $userData = urlencode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'reputation' => $user->reputation,
                'is_admin' => $user->is_admin,
            ]));
            
            $redirectUrl = "http://localhost:3000/?token={$token}&user={$userData}&provider={$provider}";
            
            return redirect($redirectUrl);
            
        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            \Log::error("OAuth invalid state error", [
                'provider' => $provider,
                'error' => $e->getMessage()
            ]);
            $error = urlencode('OAuth state validation failed. Please try again.');
            return redirect("http://localhost:3000/?error={$error}");
            
        } catch (\Exception $e) {
            \Log::error("OAuth authentication error", [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Redirect to frontend with specific error
            $error = urlencode('OAuth authentication failed: ' . $e->getMessage());
            return redirect("http://localhost:3000/?error={$error}");
        }
    }

    /**
     * Find or create a user based on OAuth data.
     */
    private function findOrCreateUser($socialUser, string $provider): User
    {
        // First, try to find user by existing OAuth provider
        $oauthProvider = OAuthProvider::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($oauthProvider) {
            return $oauthProvider->user;
        }

        // Try to find user by email
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            return $user;
        }

        // Create new user
        $user = User::create([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'password' => Hash::make(Str::random(16)), // Random password for OAuth users
            'reputation' => 0.5, // Default reputation
            'is_admin' => false,
        ]);

        return $user;
    }

    /**
     * Update or create OAuth provider record.
     */
    private function updateOAuthProvider(User $user, $socialUser, string $provider): void
    {
        OAuthProvider::updateOrCreate(
            [
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
            ],
            [
                'provider_data' => [
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                    'nickname' => $socialUser->getNickname(),
                ]
            ]
        );
    }

    /**
     * Logout the user and revoke tokens.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }
}
