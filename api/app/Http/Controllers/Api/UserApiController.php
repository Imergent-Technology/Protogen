<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserApiController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        try {
            $query = User::with('oauthProviders');

            // Search by name or email
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Filter by admin status
            if ($request->has('is_admin')) {
                $query->where('is_admin', $request->boolean('is_admin'));
            }

            // Filter by reputation range
            if ($request->has('reputation_min')) {
                $query->where('reputation', '>=', $request->float('reputation_min'));
            }
            if ($request->has('reputation_max')) {
                $query->where('reputation', '<=', $request->float('reputation_max'));
            }

            $users = $query->paginate($request->get('per_page', 15));

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        try {
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        try {
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'reputation' => 'sometimes|numeric|min:0|max:1',
                'is_admin' => 'sometimes|boolean',
            ]);

            $user->update($request->only(['name', 'email', 'reputation', 'is_admin']));

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        try {
            $user->delete();
            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get user statistics.
     */
    public function stats()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'admin_users' => User::where('is_admin', true)->count(),
                'oauth_users' => User::whereHas('oauthProviders')->count(),
                'average_reputation' => User::avg('reputation'),
                'reputation_distribution' => [
                    'low' => User::where('reputation', '<', 0.3)->count(),
                    'medium' => User::whereBetween('reputation', [0.3, 0.7])->count(),
                    'high' => User::where('reputation', '>', 0.7)->count(),
                ]
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
