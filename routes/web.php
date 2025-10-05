<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
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

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
