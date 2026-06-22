<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Paciente;
use App\Models\Sesion;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function resumen()
    {
        try {
            $hoy = now()->toDateString();
            $userId = auth()->id(); 

            // 1. Total de Pacientes del psicólogo logueado
            $pacientesActivos = Paciente::where('user_id', $userId)->count(); 

            // 2. Sesiones programadas para el día de hoy (Con verificación de existencia de relación)
            $sesionesHoy = 0;
            if (method_exists(Sesion::class, 'paciente')) {
                $sesionesHoy = Sesion::whereHas('paciente', function($query) use ($userId) {
                                         $query->where('user_id', $userId);
                                     })
                                     ->whereDate('fecha_sesion', $hoy)
                                     ->where('status', true)
                                     ->count();
            } else {
                // Caída segura en caso de que la relación en el modelo Sesion se llame diferente
                Log::warning("La relación 'paciente' no existe en el modelo Sesion.");
            }

            $alertasIA = 0; 

            // 4. Directorio rápido (Últimos 4 registros incluyendo el campo status)
            $pacientesRecientes = Paciente::where('user_id', $userId)
                                          ->orderBy('updated_at', 'desc')
                                          ->take(4)
                                          ->get(['id', 'nombre', 'apellido_paterno', 'email', 'status']);

            // 5. Estructura de gráfica base
            $evolucionSemanal = [
                ['semana' => 'Sem 1', 'porcentaje' => 40],
                ['semana' => 'Sem 2', 'porcentaje' => 60],
                ['semana' => 'Sem 3', 'porcentaje' => 85],
                ['semana' => 'Sem 4', 'porcentaje' => 100],
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'metricas' => [
                        'pacientes_activos' => $pacientesActivos,
                        'sesiones_hoy' => $sesionesHoy,
                        'alertas_ia' => $alertasIA
                    ],
                    'pacientes_recientes' => $pacientesRecientes,
                    'evolucion' => $evolucionSemanal
                ]
            ]);

        } catch (\Exception $e) {
            // Guardamos el error real en los logs de Laravel para que puedas revisarlo en storage/logs/laravel.log
            Log::error("Fallo en DashboardController@resumen: " . $e->getMessage());

            return response()->json([
                'success' => false, 
                'message' => 'Error interno al procesar las métricas del dashboard.',
                'debug_error' => $e->getMessage() // Te lo envía al network tab para revisión rápida
            ], 500);
        }
    }
}