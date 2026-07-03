<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Paciente;
use App\Models\Sesion;
use App\Models\Diagnostico;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    public function dashboardStats(Request $request)
    {
        try {
            $userId = auth()->id();

            // 1. KPIs Generales
            $totalPacientes = Paciente::where('user_id', $userId)->count();
            $totalSesiones = Sesion::where('user_id', $userId)->where('status', true)->count();
            $sesionesEsteMes = Sesion::where('user_id', $userId)->where('status', true)
                                     ->whereMonth('fecha_sesion', date('m'))
                                     ->whereYear('fecha_sesion', date('Y'))->count();

            // 2. Top Diagnósticos
            $topDiagnosticos = Diagnostico::where('user_id', $userId)
                ->where('status', true)
                ->select('codigo_cie', 'nombre_diagnostico', DB::raw('count(*) as total'))
                ->groupBy('codigo_cie', 'nombre_diagnostico')
                ->orderByDesc('total')
                ->limit(5)
                ->get();

            // 3. Demografía (Género)
            $pacientes = Paciente::where('user_id', $userId)->with('genero')->get();
            $generosAgrupados = $pacientes->groupBy(function($p) {
                return $p->genero ? ($p->genero->valor ?? $p->genero->nombre) : 'No especificado';
            });
            
            $generoStats = $generosAgrupados->map(function($group, $key) {
                return ['name' => ucfirst(strtolower($key)), 'value' => $group->count()];
            })->values();

            // 4. Termómetro IA
            $sesionesIA = Sesion::where('user_id', $userId)->with('nota.analisisSentimiento')->get();
            $nlpCounts = ['Positivo' => 0, 'Neutral' => 0, 'Riesgo' => 0];
            
            foreach($sesionesIA as $sesion) {
                $nota = $sesion->nota ?? $sesion->nota_clinica ?? null; 
                if ($nota) {
                    $nlp = $nota->analisisSentimiento ?? $nota->analisis_sentimiento ?? null;
                    if ($nlp) {
                        if ($nlp->estrellas >= 4) { $nlpCounts['Positivo']++; }
                        elseif ($nlp->estrellas <= 2) { $nlpCounts['Riesgo']++; }
                        else { $nlpCounts['Neutral']++; }
                    }
                }
            }
            
            $nlpStats = [];
            foreach($nlpCounts as $name => $value) {
                if ($value > 0) {
                    $nlpStats[] = ['name' => $name, 'value' => $value];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'kpis' => [
                        'total_pacientes' => $totalPacientes,
                        'total_sesiones' => $totalSesiones,
                        'sesiones_mes' => $sesionesEsteMes
                    ],
                    'top_diagnosticos' => $topDiagnosticos,
                    'genero_stats' => $generoStats,
                    'nlp_stats' => $nlpStats
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // NUEVA FUNCIÓN: Solo para la lista paginada de ingresos
    public function pacientesRecientes(Request $request)
    {
        try {
            $pacientes = Paciente::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(5); // Trae solo 5 por página

            return response()->json([
                'success' => true,
                'data' => $pacientes
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // NUEVA FUNCIÓN: Genera un PDF real en el servidor
    public function exportarReportePdf(Request $request)
    {
        try {
            $userId = auth()->id();

            // 1. KPIs Generales
            $totalPacientes = Paciente::where('user_id', $userId)->count();
            $totalSesiones = Sesion::where('user_id', $userId)->where('status', true)->count();
            $sesionesEsteMes = Sesion::where('user_id', $userId)->where('status', true)
                                     ->whereMonth('fecha_sesion', date('m'))
                                     ->whereYear('fecha_sesion', date('Y'))->count();

            // 2. Top Diagnósticos
            $topDiagnosticos = Diagnostico::where('user_id', $userId)
                ->where('status', true)
                ->select('codigo_cie', 'nombre_diagnostico', DB::raw('count(*) as total'))
                ->groupBy('codigo_cie', 'nombre_diagnostico')
                ->orderByDesc('total')
                ->limit(10) // Traemos hasta 10 para el reporte escrito
                ->get();

            // 3. Demografía
            $pacientes = Paciente::where('user_id', $userId)->with('genero')->get();
            $generosAgrupados = $pacientes->groupBy(function($p) {
                return $p->genero ? ($p->genero->valor ?? $p->genero->nombre) : 'No especificado';
            });
            $generoStats = $generosAgrupados->map(function($group, $key) {
                return ['name' => ucfirst(strtolower($key)), 'total' => $group->count()];
            })->values();

            // 4. Termómetro IA
            $sesionesIA = Sesion::where('user_id', $userId)->with('nota.analisisSentimiento')->get();
            $nlpCounts = ['Positivo' => 0, 'Neutral' => 0, 'Riesgo' => 0];
            foreach($sesionesIA as $sesion) {
                $nota = $sesion->nota ?? $sesion->nota_clinica ?? null; 
                if ($nota) {
                    $nlp = $nota->analisisSentimiento ?? $nota->analisis_sentimiento ?? null;
                    if ($nlp) {
                        if ($nlp->estrellas >= 4) { $nlpCounts['Positivo']++; }
                        elseif ($nlp->estrellas <= 2) { $nlpCounts['Riesgo']++; }
                        else { $nlpCounts['Neutral']++; }
                    }
                }
            }

            // 5. Últimos Ingresos (Traemos 10 para llenar el reporte)
            $pacientesRecientes = Paciente::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $stats = [
                'kpis' => [
                    'total_pacientes' => $totalPacientes,
                    'total_sesiones' => $totalSesiones,
                    'sesiones_mes' => $sesionesEsteMes
                ],
                'top_diagnosticos' => $topDiagnosticos,
                'genero_stats' => $generoStats,
                'nlp_stats' => $nlpCounts,
                'pacientes_recientes' => $pacientesRecientes
            ];

            // Cargar la vista Blade de DomPDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.reporte_general', compact('stats'));
            
            return $pdf->download('Reporte_Clinico_General.pdf');

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al generar PDF: ' . $e->getMessage()], 500);
        }
    }

    public function todosLosPacientes(Request $request)
    {
        try {
            $pacientes = Paciente::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get(['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'created_at']);

            return response()->json([
                'success' => true,
                'data' => $pacientes
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al obtener pacientes: ' . $e->getMessage()], 500);
        }
    }
}