<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DemoSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [AuthenticatedSessionController::class, 'create'])
    ->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('map', function () {
        return Inertia::render('map');
    })->name('map');

    Route::get('statistics', function () {
        return Inertia::render('statistics');
    })->name('statistics');
});

Route::get('/reset-demo/philipmamon', [DemoSessionController::class, 'reset']);

Route::get('/auth/status', function() {
    return response()->json([
        'status' => Auth::check() ? 'authenticated' : 'unauthenticated'
    ]);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
