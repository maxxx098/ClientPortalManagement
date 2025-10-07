<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ClientDashboardController extends Controller
{
    /**
     * Get the client's key ID from session 
     */
    private function getClientKeyId()
    {
        $user = auth()->user();
        
        // Method 1: Check session first (most reliable for client login)
        if (session()->has('client_key_id')) {
            return session('client_key_id');
        }
        
        // Method 2: Extract from email if user is a client
        if ($user && str_starts_with($user->email, 'client-')) {
            $emailParts = explode('@', $user->email);
            return str_replace('client-', '', $emailParts[0]);
        }
        
        // Method 3: Check user's client_key_id column (if you have one)
        if ($user && isset($user->client_key_id)) {
            return $user->client_key_id;
        }
        
        return null;
    }

    /**
     * Display the client dashboard
     */
    public function index()
    {
        $clientKeyId = $this->getClientKeyId();
        
        if (!$clientKeyId) {
            Log::error('Client key ID not found for user', [
                'user_id' => auth()->id(),
                'user_email' => auth()->user()->email,
            ]);
            
            abort(403, 'Client key not found.');
        }

        // Get statistics
        $totalProjects = Project::where('client_key_id', $clientKeyId)->count();
        $activeProjects = Project::where('client_key_id', $clientKeyId)
            ->where('status', 'in_progress')
            ->count();
        $completedProjects = Project::where('client_key_id', $clientKeyId)
            ->where('status', 'completed')
            ->count();
        
        $totalTasks = Task::where('client_key_id', $clientKeyId)->count();
        $pendingTasks = Task::where('client_key_id', $clientKeyId)
            ->where('status', 'todo')
            ->count();
        $inProgressTasks = Task::where('client_key_id', $clientKeyId)
            ->where('status', 'in_progress')
            ->count();
        $completedTasks = Task::where('client_key_id', $clientKeyId)
            ->where('status', 'done')
            ->count();

        // Get recent projects
        $recentProjects = Project::where('client_key_id', $clientKeyId)
            ->latest()
            ->take(5)
            ->get();

        // Get recent tasks
        $recentTasks = Task::where('client_key_id', $clientKeyId)
            ->with('clientKey:id,key')
            ->latest()
            ->take(5)
            ->get();

        // Get upcoming deadlines
        $upcomingDeadlines = Project::where('client_key_id', $clientKeyId)
            ->whereNotNull('due_date')
            ->where('due_date', '>=', now())
            ->where('status', '!=', 'completed')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        // Project status distribution
        $projectsByStatus = Project::where('client_key_id', $clientKeyId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Task status distribution
        $tasksByStatus = Task::where('client_key_id', $clientKeyId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return Inertia::render('client/dashboard', [
            'stats' => [
                'projects' => [
                    'total' => $totalProjects,
                    'active' => $activeProjects,
                    'completed' => $completedProjects,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'pending' => $pendingTasks,
                    'in_progress' => $inProgressTasks,
                    'completed' => $completedTasks,
                ],
            ],
            'recentProjects' => $recentProjects,
            'recentTasks' => $recentTasks,
            'upcomingDeadlines' => $upcomingDeadlines,
            'projectsByStatus' => $projectsByStatus,
            'tasksByStatus' => $tasksByStatus,
            'client_key_id' => $clientKeyId,
        ]);
    }
}