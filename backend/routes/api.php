<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogoController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\SesionController;
use App\Http\Controllers\Api\NotaClinicaController;
use App\Http\Controllers\Api\DiagnosticoController;

/*
|--------------------------------------------------------------------------
| API Routes — Plataforma de Apoyo Clínico
|--------------------------------------------------------------------------
|
| Convención de nombres:
|   - Rutas públicas:   sin prefijo de middleware
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

    //Registro de nuevas cuentas (psicológos) y login de usuarios existentes
    Route::prefix('auth')->group(function () {
        Route::post('login',    [AuthController::class, 'login'])
            ->name('auth.login');
        Route::post('register', [AuthController::class, 'register'])
            ->name('auth.register');
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
            
        // NUEVA RUTA PARA ACTUALIZAR PERFIL DEL PSICÓLOGO
        Route::put('perfil', [AuthController::class, 'updateProfile'])
            ->name('auth.updateProfile');
            
        Route::post('logout', [AuthController::class, 'logout'])
            ->name('auth.logout');
    });

    // Catálogos (solo lectura)
    Route::prefix('catalogos')->group(function () {
        Route::get('/',         [CatalogoController::class, 'index'])
            ->name('catalogos.index');
        Route::get('{grupo}',   [CatalogoController::class, 'porGrupo'])
            ->name('catalogos.porGrupo');
    });

    // Pacientes (CRUD completo)
    Route::apiResource('pacientes', PacienteController::class);

    // Sesiones anidadas bajo paciente
    Route::prefix('pacientes/{paciente}')->group(function () {
        Route::get('sesiones',              [SesionController::class, 'index'])
            ->name('sesiones.index');
        Route::post('sesiones',             [SesionController::class, 'store'])
            ->name('sesiones.store');
        Route::get('sesiones/{sesion}',     [SesionController::class, 'show'])
            ->name('sesiones.show');
        Route::put('sesiones/{sesion}',     [SesionController::class, 'update'])
            ->name('sesiones.update');
        Route::delete('sesiones/{sesion}',  [SesionController::class, 'destroy'])
            ->name('sesiones.destroy');

         // Diagnósticos
        Route::get('diagnosticos',                [DiagnosticoController::class, 'index'])
            ->name('diagnosticos.index');
        Route::post('diagnosticos',               [DiagnosticoController::class, 'store'])
            ->name('diagnosticos.store');
        Route::get('diagnosticos/{diagnostico}',  [DiagnosticoController::class, 'show'])
            ->name('diagnosticos.show');
        Route::put('diagnosticos/{diagnostico}',  [DiagnosticoController::class, 'update'])
            ->name('diagnosticos.update');
        Route::delete('diagnosticos/{diagnostico}', [DiagnosticoController::class, 'destroy'])
            ->name('diagnosticos.destroy');   
    });

    // Nota clínica de una sesión
    Route::prefix('sesiones/{sesion}')->group(function () {
        Route::get('nota',  [NotaClinicaController::class, 'show'])
            ->name('nota.show');
        Route::post('nota', [NotaClinicaController::class, 'store'])
            ->name('nota.store');
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