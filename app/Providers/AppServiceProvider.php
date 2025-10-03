<?php

namespace App\Providers;

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use App\Models\ClientKey;
use App\Models\Project;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share([
            'auth' => function () {
                $user = Auth::user();

                if (!$user) {
                    return null;
                }

                // Try to match the user to a client key
                $clientKey = ClientKey::where('email', $user->email)->first();

                return [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,

                    // Expose clientKey info
                    'clientKey'   => $clientKey,
                    'hasProjects' => $clientKey
                        ? Project::where('client_key_id', $clientKey->id)->exists()
                        : false,
                ];
            },
        ]);
    }
}
