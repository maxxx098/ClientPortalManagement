<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsClient
{
    public function handle(Request $request, Closure $next): Response
    {
        $isClient = $request->session()->get('is_client', false);
        $clientKeyId = $request->session()->get('client_key_id');

        // Check session first
        if ($isClient && $clientKeyId) {
            return $next($request);
        }

        // For API-like requests (comments), check request body
        if ($request->has('client_key_id')) {
            $requestClientKeyId = $request->input('client_key_id');
            
            // Validate the client_key_id exists
            $keyExists = \App\Models\ClientKey::where('id', $requestClientKeyId)
                ->where('is_used', true)
                ->exists();
            
            if ($keyExists) {
                return $next($request);
            }
        }

        abort(403, 'Access denied. This area is for clients only.');
    }
}