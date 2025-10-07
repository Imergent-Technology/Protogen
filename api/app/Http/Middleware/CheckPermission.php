<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $permission  The permission to check
     * @param  string|null  $scope  Optional scope (global, tenant, resource)
     */
    public function handle(Request $request, Closure $next, string $permission, ?string $scope = null): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Unauthenticated',
                'message' => 'You must be logged in to access this resource'
            ], 401);
        }

        // Resolve tenant context if needed
        $tenant = $this->resolveTenant($request);

        // Check if user has the required permission
        if (!$this->hasPermission($user, $permission, $tenant, $request)) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You do not have permission to perform this action',
                'required_permission' => $permission
            ], 403);
        }

        // Add permission context to request for controllers to use
        $request->merge([
            '_permission_context' => [
                'user' => $user,
                'tenant' => $tenant,
                'permission' => $permission,
            ]
        ]);

        return $next($request);
    }

    /**
     * Check if user has the required permission.
     */
    private function hasPermission($user, string $permission, ?Tenant $tenant, Request $request): bool
    {
        // System admin always has all permissions
        if ($user->isAdmin()) {
            return true;
        }

        // Check user's direct permission
        if ($user->hasPermission($permission, $tenant)) {
            return true;
        }

        // Check if permission can be earned through standing
        if ($this->canEarnPermission($user, $permission)) {
            return true;
        }

        return false;
    }

    /**
     * Resolve tenant from request.
     */
    private function resolveTenant(Request $request): ?Tenant
    {
        // Check for tenant_id in route parameters
        if ($request->route('tenant')) {
            return Tenant::find($request->route('tenant'));
        }

        // Check for tenant_id in request body
        if ($request->has('tenant_id')) {
            return Tenant::find($request->input('tenant_id'));
        }

        // Check for tenant in header
        if ($request->header('X-Tenant-ID')) {
            return Tenant::find($request->header('X-Tenant-ID'));
        }

        return null;
    }

    /**
     * Check if user can earn permission through standing.
     */
    private function canEarnPermission($user, string $permission): bool
    {
        // Get the permission model
        $permissionModel = \App\Models\Permission::where('slug', $permission)->first();

        if (!$permissionModel) {
            return false;
        }

        // Check if user meets standing requirement
        if ($permissionModel->standing_requirement && $user->standing >= $permissionModel->standing_requirement) {
            return true;
        }

        return false;
    }
}
