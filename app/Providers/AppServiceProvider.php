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

                // CRITICAL FIX: Determine if user is a client based on MULTIPLE sources
                $isClient = false;
                $clientKeyUUID = null;

                // Method 1: Check session (if available)
                if (session()->has('is_client') && session('is_client') === true) {
                    $isClient = true;
                    $clientKeyUUID = session('client_key_id');
                }

                // Method 2: Check user role
                if (!$isClient && isset($user->role) && $user->role === 'client') {
                    $isClient = true;
                }

                // Method 3: Check email pattern (most reliable for client users)
                if (!$isClient && str_starts_with($user->email, 'client-')) {
                    $isClient = true;
                }

                // Extract client_key_id from email if not found in session
                if ($isClient && !$clientKeyUUID && str_starts_with($user->email, 'client-')) {
                    // Extract key from email format: client-{key}@system.local
                    $emailParts = explode('@', $user->email);
                    $clientKeyUUID = str_replace('client-', '', $emailParts[0]);
                    
                    \Log::info('AppServiceProvider: Extracted client_key_id from email', [
                        'user_email' => $user->email,
                        'extracted_key' => $clientKeyUUID,
                    ]);
                }

                // Determine which projects to show in sidebar
                $projectsForSidebar = [];
                
                if ($isClient && $clientKeyUUID) {
                    // Client: show only their projects
                    $projectsForSidebar = Project::where('client_key_id', $clientKeyUUID)
                        ->orderBy('created_at', 'desc')
                        ->get(['id', 'name'])
                        ->toArray();
                        
                    \Log::info('AppServiceProvider: Client projects loaded', [
                        'client_key_id' => $clientKeyUUID,
                        'count' => count($projectsForSidebar),
                        'projects' => array_column($projectsForSidebar, 'name'),
                    ]);
                } elseif (!$isClient && ($user->is_admin ?? false)) {
                    // Admin: show all projects
                    $projectsForSidebar = Project::orderBy('created_at', 'desc')
                        ->get(['id', 'name'])
                        ->toArray();
                        
                    \Log::info('AppServiceProvider: Admin projects loaded', [
                        'count' => count($projectsForSidebar),
                    ]);
                }

                $authData = [
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

                // Debug logging
                \Log::info('AppServiceProvider: Auth data being shared', [
                    'user_email' => $user->email,
                    'user_role' => $user->role ?? 'none',
                    'user_is_admin' => $user->is_admin ?? false,
                    'client_key_id' => $clientKeyUUID,
                    'is_client' => $isClient,
                    'projects_count' => count($projectsForSidebar),
                    'session_has_client_key' => session()->has('client_key_id'),
                    'session_client_key_value' => session('client_key_id'),
                ]);

                return $authData;
            },

             'recentActivity' => function () {
            $activities = collect();

            // Latest projects
            Project::latest()->take(3)->get()->each(function ($project) use ($activities) {
                $activities->push([
                    'id' => 'project-' . $project->id,
                    'type' => 'project',
                    'description' => "New project created: {$project->name}",
                    'timestamp' => $project->created_at,
                ]);
            });

            // Latest tasks (if you have Task model)
            if (class_exists(\App\Models\Task::class)) {
                \App\Models\Task::latest()->take(3)->get()->each(function ($task) use ($activities) {
                    $activities->push([
                        'id' => 'task-' . $task->id,
                        'type' => 'task',
                        'description' => "New task created: {$task->title}",
                        'timestamp' => $task->created_at,
                    ]);
                });
            }

            return $activities
                ->sortByDesc('timestamp')
                ->values()
                ->take(8);
        },
        ]);
    }
}