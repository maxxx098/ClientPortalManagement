<?php

use App\Http\Controllers\Admin\ClientKeyController;
use App\Http\Controllers\Admin\ProjectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->email === 'client@system.local') {
            return Inertia::render('client/dashboard');
        }

        return Inertia::render('admin/dashboard');
    })->name('dashboard');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/client-keys', [ClientKeyController::class, 'index'])->name('client-keys.index');
    Route::post('/admin/client-keys', [ClientKeyController::class, 'store'])->name('client-keys.store');
    Route::patch('/admin/client-keys/{id}/used', [ClientKeyController::class, 'markUsed'])->name('client-keys.markUsed');
    Route::delete('/admin/client-keys/{id}', [ClientKeyController::class, 'destroy'])->name('client-keys.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/admin/projects', [\App\Http\Controllers\Admin\ProjectController::class, 'index'])->name('projects.index');
    Route::post('/admin/projects', [\App\Http\Controllers\Admin\ProjectController::class, 'store'])->name('projects.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
