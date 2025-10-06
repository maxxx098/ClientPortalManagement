<?php

use App\Http\Controllers\Admin\ClientKeyController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Client\ClientProjectController;
use App\Http\Controllers\Client\ClientTaskController;
use App\Http\Controllers\CommentReactionController;
use App\Http\Controllers\CommentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $isClient = session('is_client', false);

        // Clients see client dashboard
        if ($isClient || $user->role === 'client') {
            return Inertia::render('client/dashboard');
        }

        // Admins see admin dashboard
        return Inertia::render('admin/dashboard');
    })->name('dashboard');
});

// ============================================
// ADMIN ONLY ROUTES
// ============================================
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // Client Keys Management
    Route::get('/client-keys', [ClientKeyController::class, 'index'])->name('client-keys.index');
    Route::post('/client-keys', [ClientKeyController::class, 'store'])->name('client-keys.store');
    Route::get('/client-keys/list', [ClientKeyController::class, 'list'])->name('client-keys.list');
    Route::patch('/client-keys/{id}/used', [ClientKeyController::class, 'markUsed'])->name('client-keys.markUsed');
    Route::delete('/client-keys/{id}', [ClientKeyController::class, 'destroy'])->name('client-keys.destroy');

    // Admin Projects Management (all projects)
    Route::get('/projects', [AdminProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [AdminProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [AdminProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [AdminProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [AdminProjectController::class, 'update'])->name('projects.update');
    Route::patch('/projects/{project}', [AdminProjectController::class, 'update']);
    Route::delete('/projects/{project}', [AdminProjectController::class, 'destroy'])->name('projects.destroy');

    // Admin Tasks Management (all tasks)
    Route::get('/tasks', [AdminTaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [AdminTaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}/edit', [AdminTaskController::class, 'edit'])->name('tasks.edit');
    Route::patch('/tasks/{task}', [AdminTaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [AdminTaskController::class, 'destroy'])->name('tasks.destroy');

    Route::get('/tasks/{task}/comments', [CommentController::class, 'index'])->name('comments.index');
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/react', [CommentReactionController::class, 'react']);
    
});

// ============================================
// CLIENT ONLY ROUTES
// ============================================
Route::middleware(['auth', 'verified', 'client'])->prefix('client')->name('client.')->group(function () {
    // Client Projects (filtered by UUID)
    Route::get('/projects', [ClientProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ClientProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ClientProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ClientProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [ClientProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [ClientProjectController::class, 'update'])->name('projects.update');
    Route::patch('/projects/{project}', [ClientProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ClientProjectController::class, 'destroy'])->name('projects.destroy');

    // Client Tasks (filtered by client_key_id)
    Route::get('/tasks', [ClientTaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [ClientTaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}/edit', [ClientTaskController::class, 'edit'])->name('tasks.edit');
    Route::patch('/tasks/{task}', [ClientTaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [ClientTaskController::class, 'destroy'])->name('tasks.destroy');

    Route::get('/tasks/{task}/comments', [CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::patch('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/comments/{comment}/react', [CommentReactionController::class, 'react']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';