<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\ClientKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $role = $request->input('role');

        if ($role === 'client') {
            $clientKey = ClientKey::where('key', $request->client_key)->first();

            if (!$clientKey) {
                return back()->withErrors([
                    'client_key' => 'Invalid client key.',
                ]);
            }

            // Check if locked and not expired
            if ($clientKey->locked && $clientKey->locked_at && $clientKey->locked_at->gt(now()->subMinutes(30))) {
                return back()->withErrors([
                    'client_key' => 'This key is currently in use. Try again later.',
                ]);
            }

            // Lock key for this session
            $clientKey->update([
                'locked' => true,
                'locked_at' => now(),
            ]);

            // Create unique client user based on UUID with explicit role
            $clientUser = User::firstOrCreate(
                ['email' => 'client-' . $clientKey->key . '@system.local'],
                [
                    'name' => 'Client ' . substr($clientKey->key, 0, 8),
                    'password' => bcrypt(str()->random(32)),
                    'role' => 'client', // Explicitly set role
                    'is_admin' => false, // Explicitly set is_admin to false
                ]
            );

            Auth::login($clientUser);
            
            // Regenerate session FIRST
            $request->session()->regenerate();
            
            // THEN set the session data AFTER regeneration
            $request->session()->put('client_key_id', $clientKey->key);
            $request->session()->put('is_client', true);
            
            // Force save the session
            $request->session()->save();
            
            // Debug logs
            \Log::info('Client Login:', [
                'key' => $clientKey->key,
                'user_email' => $clientUser->email,
                'user_role' => $clientUser->role,
                'user_is_admin' => $clientUser->is_admin,
                'session_key' => $request->session()->get('client_key_id'),
                'is_client' => $request->session()->get('is_client'),
                'session_id' => $request->session()->getId()
            ]);

            return redirect()->intended(route('dashboard'))
                ->with('success', 'Logged in with client key!');
        }

        // --- ADMIN FLOW ---
        $user = $request->validateCredentials();

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();
        
        // Explicitly set is_client to false for admins
        $request->session()->put('is_client', false);
        $request->session()->save();

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        if ($request->session()->has('client_key_id')) {
            // Query by 'key' column (UUID) instead of 'id'
            ClientKey::where('key', $request->session()->get('client_key_id'))
                ->update(['locked' => false, 'locked_at' => null]);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}