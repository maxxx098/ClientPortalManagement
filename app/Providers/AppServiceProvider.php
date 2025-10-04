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
                
                // If no user is logged in, return minimal structure
                if (!$user) {
                    return [
                        'user' => null,
                        'client_key_id' => null,
                        'is_client' => false,
                        'projectsForSidebar' => [],
                    ];
                }

                $clientKeyUUID = session('client_key_id');
                $isClient = session('is_client', false);

                // IMPROVED: Better fallback logic
                // Check if user's email starts with 'client-' OR if user role is 'client'
                if (!$isClient) {
                    if ($user->role === 'client' || str_starts_with($user->email, 'client-')) {
                        $isClient = true;
                        
                        // If client_key_id is missing but user is a client, extract it from email
                        if (!$clientKeyUUID && str_starts_with($user->email, 'client-')) {
                            // Extract key from email format: client-{key}@system.local
                            $emailParts = explode('@', $user->email);
                            $clientKeyUUID = str_replace('client-', '', $emailParts[0]);
                            
                            // Re-set session data
                            session(['client_key_id' => $clientKeyUUID, 'is_client' => true]);
                        }
                    }
                }

                // Debug logging
                \Log::info('AppServiceProvider Auth Share:', [
                    'user_email' => $user->email,
                    'user_role' => $user->role ?? 'none',
                    'user_is_admin' => $user->is_admin ?? false,
                    'client_key_id' => $clientKeyUUID,
                    'is_client' => $isClient,
                    'session_id' => session()->getId(),
                ]);

                // Determine which projects to show in sidebar
                $projectsForSidebar = [];
                
                if ($isClient && $clientKeyUUID) {
                    // Client: show only their projects
                    $projectsForSidebar = Project::where('client_key_id', $clientKeyUUID)
                        ->orderBy('created_at', 'desc')
                        ->get(['id', 'name'])
                        ->toArray();
                        
                    \Log::info('Client projects query:', [
                        'client_key_id' => $clientKeyUUID,
                        'count' => count($projectsForSidebar),
                    ]);
                } elseif (!$isClient && ($user->is_admin ?? false)) {
                    // Admin: show all projects
                    $projectsForSidebar = Project::orderBy('created_at', 'desc')
                        ->get(['id', 'name'])
                        ->toArray();
                        
                    \Log::info('Admin projects query:', [
                        'count' => count($projectsForSidebar),
                    ]);
                }

                \Log::info('Projects for sidebar:', [
                    'count' => count($projectsForSidebar),
                    'projects' => $projectsForSidebar,
                ]);

                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role ?? 'client',
                        'is_admin' => $user->is_admin ?? false,
                    ],
                    'client_key_id' => $clientKeyUUID,
                    'is_client' => $isClient,
                    'projectsForSidebar' => $projectsForSidebar,
                ];
            },
        ]);
    }
}