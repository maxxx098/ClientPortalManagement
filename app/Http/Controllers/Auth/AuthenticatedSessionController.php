<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
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
        // Fetch client key
        $clientKey = \App\Models\ClientKey::where('key', $request->client_key)
            ->where('used', false)
            ->first();

        if (!$clientKey) {
            return back()->withErrors([
                'client_key' => 'Invalid or already used client key.',
            ]);
        }

        // Mark the key as used
        $clientKey->update(['used' => true]);

        // Log in a generic client user (or tie to a real Client model if you want)
        $clientUser = \App\Models\User::firstOrCreate(
            ['email' => 'client@system.local'],
            [
                'name' => 'Client User',
                'password' => bcrypt(str()->random(16)),
            ]
        );

        Auth::login($clientUser);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'))
            ->with('success', 'Logged in with client key!');
    }

    // --- ADMIN FLOW ---
    $user = $request->validateCredentials();

    Auth::login($user, $request->boolean('remember'));

    $request->session()->regenerate();

    return redirect()->intended(route('dashboard'));
}


    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
