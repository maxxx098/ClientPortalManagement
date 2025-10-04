<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $isClient = $request->session()->get('is_client', false);

        // Check if user is not authenticated
        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user is a client (logged in via client key)
        if ($isClient) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        // Check if user is not an admin
        if (!$user->is_admin && $user->role !== 'admin') {
            abort(403, 'Access denied. Admin privileges required.');
        }

        return $next($request);
    }
}