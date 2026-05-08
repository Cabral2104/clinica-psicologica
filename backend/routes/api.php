<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Plataforma de Apoyo Clínico
|--------------------------------------------------------------------------
|
| Convención de nombres:
|   - Rutas públicas:    sin prefijo de middleware
|   - Rutas protegidas: middleware 'auth:sanctum'
|
| Versión actual: v1
| Prefijo base:   /api  (configurado en bootstrap/app.php)
|
*/

/*
|--------------------------------------------------------------------------
| Rutas públicas — No requieren token
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {

    // Autenticación
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])
            ->name('auth.login');
    });

});

/*
|--------------------------------------------------------------------------
| Rutas protegidas — Requieren token Sanctum válido
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {

    // Autenticación
    Route::prefix('auth')->group(function () {
        Route::get('me',     [AuthController::class, 'me'])
            ->name('auth.me');
        Route::post('logout', [AuthController::class, 'logout'])
            ->name('auth.logout');
    });

    /*
    | Los siguientes módulos se irán agregando aquí:
    |
    | Route::apiResource('catalogos',  CatalogoController::class);
    | Route::apiResource('pacientes',  PacienteController::class);
    | Route::apiResource('sesiones',   SesionController::class);
    | Route::apiResource('notas',      NotaClinicaController::class);
    */

});