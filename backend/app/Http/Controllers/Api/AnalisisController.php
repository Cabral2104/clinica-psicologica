<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AnalisisSentimiento;
use App\Models\NotaClinica;
use App\Models\Sesion;
use App\Models\Paciente;
use Illuminate\Support\Facades\Log;

class AnalisisController extends Controller
{
    public function index()
    {
        try {
            $userId = auth()->id();

            // 1. Aislamos los datos por IDs para evitar errores de relaciones inversas ausentes
            $pacientes = Paciente::where('user_id', $userId)->get()->keyBy('id');
            $sesiones = Sesion::whereIn('paciente_id', $pacientes->keys())->get()->keyBy('id');
            $notas = NotaClinica::whereIn('sesion_id', $sesiones->keys())->get()->keyBy('id');

            // 2. Traemos solo los análisis y los PAGINAMOS (ej. 6 por página)
            $analisisPaginados = AnalisisSentimiento::whereIn('nota_clinica_id', $notas->keys())
                ->orderBy('created_at', 'desc')
                ->paginate(6); // Paginación de 6 en 6 para que se vea bien en tu grid

            // 3. Mapeamos solo los items de la página actual
            $resultado = $analisisPaginados->getCollection()->map(function ($analisis) use ($notas, $sesiones, $pacientes) {
                $nota = $notas->get($analisis->nota_clinica_id);
                $sesion = $nota ? $sesiones->get($nota->sesion_id) : null;
                $paciente = $sesion ? $pacientes->get($sesion->paciente_id) : null;

                $data = $analisis->toArray();
                $data['nota_clinica'] = $nota ? $nota->toArray() : null;
                
                if ($data['nota_clinica'] && $sesion) {
                    $data['nota_clinica']['sesion'] = $sesion->toArray();
                    if ($paciente) {
                        $data['nota_clinica']['sesion']['paciente'] = $paciente->toArray();
                    }
                }
                return $data;
            });

            // Reinyectamos los datos mapeados en el paginador
            $analisisPaginados->setCollection($resultado);

            return response()->json([
                'success' => true,
                'data' => $analisisPaginados // Devolvemos el objeto paginador completo
            ], 200);

        } catch (\Exception $e) {
            Log::error("Error en AnalisisController: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar los análisis de IA',
                'error_real' => $e->getMessage()
            ], 500);
        }
    }
}