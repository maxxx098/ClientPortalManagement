<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsClient
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isClient = $request->session()->get('is_client', false);
        $clientKeyId = $request->session()->get('client_key_id');

        // Check if user is a client
        if (!$isClient || !$clientKeyId) {
            abort(403, 'Access denied. This area is for clients only.');
        }

        return $next($request);
    }
}