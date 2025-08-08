<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * Handle admin login.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->isAdmin() || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        Auth::login($user);
        
        return response()->json([
            'user' => $user,
            'message' => 'Admin logged in successfully'
        ]);
    }

    /**
     * Handle admin logout.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json(['message' => 'Admin logged out successfully']);
    }

    /**
     * Get the current admin user.
     */
    public function user(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        return response()->json(['user' => $user]);
    }

    /**
     * Check if user is authenticated as admin.
     */
    public function check(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->isAdmin()) {
            return response()->json(['authenticated' => false], 401);
        }
        
        return response()->json(['authenticated' => true, 'user' => $user]);
    }
}
