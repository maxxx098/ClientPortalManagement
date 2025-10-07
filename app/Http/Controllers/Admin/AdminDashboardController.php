<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\ClientKey;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index()
    {
        // Get client statistics
        $totalClients = ClientKey::count();
        $activeClients = ClientKey::where('locked', false)->orWhereNull('locked')->count();
        $inactiveClients = ClientKey::where('locked', true)->count();

        // Get project statistics
        $totalProjects = Project::count();
        $activeProjects = Project::where('status', 'in_progress')->count();
        $completedProjects = Project::where('status', 'completed')->count();
        $onHoldProjects = Project::where('status', 'on_hold')->count();

        // Get task statistics
        $totalTasks = Task::count();
        $pendingTasksCount = Task::where('status', 'todo')->count();
        $inProgressTasks = Task::where('status', 'in_progress')->count();
        $completedTasks = Task::where('status', 'done')->count();


        // Get user statistics
        $totalUsers = User::count();
        $adminUsers = User::where('role', 'admin')->count();
        $staffUsers = User::where('role', 'staff')->count();

        // Get recent clients with counts
        $recentClients = ClientKey::withCount(['projects', 'tasks'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($client) {
                return [
                    'id' => $client->id,
                    'key' => $client->key,
                    'name' => $client->name,
                    'email' => $client->email,
                    'status' => $client->status ?? 'active',
                    'projects_count' => $client->projects_count,
                    'tasks_count' => $client->tasks_count,
                    'created_at' => $client->created_at,
                    'last_activity' => $client->updated_at,
                ];
            });

        // Get recent projects with relationships
      $recentProjects = Project::with(['clientKey:id,key'])
        ->latest()
        ->take(6)
        ->get()
        ->map(function ($project) {
            // Get all tasks that belong to the same client_key_id
            $tasks = Task::where('client_key_id', $project->client_key_id)->get();

            $tasksCount = $tasks->count();
            $completedTasksCount = $tasks->where('status', 'done')->count();
            $progress = $tasksCount > 0
                ? round(($completedTasksCount / $tasksCount) * 100)
                : 0;

            return [
                'id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'priority' => $project->priority ?? 'medium',
                'client_key' => $project->clientKey ? [
                    'id' => $project->clientKey->id,
                    'key' => $project->clientKey->key,
                    'name' => $project->clientKey->name,
                ] : null,
                'due_date' => $project->due_date,
                'start_date' => $project->start_date,
                'tasks_count' => $tasksCount,
                'progress' => $progress,
                'created_at' => $project->created_at,
            ];
        });

        // Get recent tasks
        $recentTasks = Task::with(['clientKey:id,key'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'priority' => $task->priority ?? 'medium',
                    'client_key' => $task->clientKey ? [
                        'id' => $task->clientKey->id,
                        'key' => $task->clientKey->key,
                    ] : null,
                    'created_at' => $task->created_at,
                ];
            });


        // Get overdue tasks
       $pendingTasks = Task::with(['clientKey:id,key'])
        ->where('status', '!=', 'done')
        ->orderBy('created_at', 'asc')
        ->take(5)
        ->get()
        ->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority ?? 'high',
                'client_key' => $task->clientKey ? [
                    'id' => $task->clientKey->id,
                    'key' => $task->clientKey->key,
                    'name' => $task->clientKey->name,
                ] : null,
                'created_at' => $task->created_at,
            ];
        });


        // Get recent activity (combine different activities)
        $recentActivity = collect();

        // Recent projects
        Project::with('clientKey:id')
            ->latest()
            ->take(3)
            ->get()
            ->each(function ($project) use ($recentActivity) {
                $recentActivity->push([
                    'id' => 'project-' . $project->id,
                    'type' => 'project',
                    'description' => "New project '{$project->name}' created" . 
                        ($project->clientKey ? " for {$project->clientKey->name}" : ""),
                    'timestamp' => $project->created_at,
                ]);
            });

        // Recent tasks
        Task::with(['clientKey:id'])
            ->latest()
            ->take(3)
            ->get()
            ->each(function ($task) use ($recentActivity) {
                $recentActivity->push([
                    'id' => 'task-' . $task->id,
                    'type' => 'task',
                    'description' => "Task '{$task->title}' created" . 
                        ($task->project ? " in {$task->project->name}" : ""),
                    'timestamp' => $task->created_at,
                ]);
            });

        // Recent clients
        ClientKey::latest()
            ->take(2)
            ->get()
            ->each(function ($client) use ($recentActivity) {
                $recentActivity->push([
                    'id' => 'client-' . $client->id,
                    'type' => 'client',
                    'description' => "New client '{$client->name}' registered",
                    'timestamp' => $client->created_at,
                ]);
            });

        // Sort by timestamp descending
        $recentActivity = $recentActivity->sortByDesc('timestamp')->values()->take(8);

        // Project status distribution
        $projectsByStatus = Project::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Task status distribution
        $tasksByStatus = Task::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'clients' => [
                    'total' => $totalClients,
                    'active' => $activeClients,
                    'inactive' => $inactiveClients,
                ],
                'projects' => [
                    'total' => $totalProjects,
                    'active' => $activeProjects,
                    'completed' => $completedProjects,
                    'on_hold' => $onHoldProjects,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'pending' => $pendingTasksCount,
                    'in_progress' => $inProgressTasks,
                    'completed' => $completedTasks,
                    'overdue' => $pendingTasksCount,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'admins' => $adminUsers,
                    'staff' => $staffUsers,
                ],
            ],
            'recentClients' => $recentClients,
            'recentProjects' => $recentProjects,
            'recentTasks' => $recentTasks,
            'overdueTasks' => $pendingTasks,
            'recentActivity' => $recentActivity,
            'projectsByStatus' => $projectsByStatus,
            'tasksByStatus' => $tasksByStatus,
        ]);
    }

    /**
     * Get dashboard statistics for a specific date range
     */
    public function statistics(Request $request)
    {
        $startDate = $request->input('start_date', now()->subDays(30));
        $endDate = $request->input('end_date', now());

        $stats = [
            'new_clients' => ClientKey::whereBetween('created_at', [$startDate, $endDate])->count(),
            'new_projects' => Project::whereBetween('created_at', [$startDate, $endDate])->count(),
            'new_tasks' => Task::whereBetween('created_at', [$startDate, $endDate])->count(),
            'completed_projects' => Project::where('status', 'completed')
                ->whereBetween('updated_at', [$startDate, $endDate])
                ->count(),
            'completed_tasks' => Task::where('status', 'done')
                ->whereBetween('updated_at', [$startDate, $endDate])
                ->count(),
        ];

        return response()->json($stats);
    }
}