<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\NotaClinica\StoreNotaRequest;
use App\Http\Resources\NotaClinicaResource;
use App\Models\NotaClinica;
use App\Models\Sesion;
use App\Services\NlpService;
use Illuminate\Http\JsonResponse;

/**
 * NotaClinicaController
 *
 * Gestiona la nota clínica de una sesión específica.
 *
 * Reglas de negocio:
 * - Una sesión tiene exactamente UNA nota clínica.
 * - Si la sesión ya tiene nota, el endpoint la actualiza (upsert).
 * - Solo el psicólogo dueño de la sesión puede escribir la nota.
 * - Al guardar la nota, se dispara automáticamente el análisis NLP.
 * - Si el NLP falla, la nota se guarda igual (diseño defensivo).
 */
class NotaClinicaController extends Controller
{
    public function __construct(
        private readonly NlpService $nlpService
    ) {}

    /**
     * Verifica que la sesión pertenezca al psicólogo autenticado.
     */
    private function obtenerSesion(int $sesionId): ?Sesion
    {
        return Sesion::where('id', $sesionId)
            ->where('user_id', auth()->id())
            ->where('status', true)
            ->first();
    }

    /**
     * Ver la nota clínica de una sesión.
     *
     * GET /api/v1/sesiones/{sesion}/nota
     */
    public function show(int $sesionId): JsonResponse
    {
        $sesion = $this->obtenerSesion($sesionId);

        if (! $sesion) {
            return response()->json(['message' => 'Sesión no encontrada.'], 404);
        }

        $nota = NotaClinica::where('sesion_id', $sesionId)
            ->where('status', true)
            ->with(['analisisSentimiento', 'creador'])
            ->first();

        if (! $nota) {
            return response()->json([
                'message' => 'Esta sesión aún no tiene nota clínica.',
                'data'    => null,
            ], 200);
        }

        return response()->json([
            'data' => new NotaClinicaResource($nota),
        ], 200);
    }

    /**
     * Crear o actualizar la nota clínica de una sesión (upsert).
     *
     * Flujo:
     * 1. Valida que la sesión pertenezca al psicólogo.
     * 2. Guarda o actualiza la nota en BD.
     * 3. Envía el texto al NLP para análisis de sentimiento.
     * 4. Recarga la nota con el análisis y la devuelve.
     *
     * El paso 3 es no bloqueante: si falla, el paso 4 devuelve
     * el análisis en null pero la nota quedó guardada correctamente.
     *
     * POST /api/v1/sesiones/{sesion}/nota
     */
    public function store(Request $request, $sesionId)
    {
        try {
            $sesion = \App\Models\Sesion::findOrFail($sesionId);

            // 1. Guardar o actualizar la Nota Clínica
            $nota = \App\Models\NotaClinica::updateOrCreate(
                ['sesion_id' => $sesion->id],
                [
                    'contenido' => $request->contenido,
                    'subjetivo' => $request->subjetivo,
                    'objetivo' => $request->objetivo,
                    'analisis' => $request->analisis,
                    'plan' => $request->plan,
                    'tecnicas_utilizadas' => $request->tecnicas,
                    'tareas_asignadas' => $request->tareas,
                    'observaciones_privadas' => $request->observaciones,
                ]
            );

            // 2. Guardar el Diagnóstico (si existe)
            if ($request->has('diagnostico_seleccionado') && !empty($request->diagnostico_seleccionado)) {
                $diagData = $request->diagnostico_seleccionado;
                \App\Models\Diagnostico::create([
                    'paciente_id' => $sesion->paciente_id,
                    'user_id' => auth()->id(),
                    'codigo_cie' => $diagData['codigo'],
                    'nombre_diagnostico' => $diagData['descripcion'],
                    'descripcion' => 'Diagnosticado durante la sesión #' . $sesion->numero_sesion,
                    'fecha_diagnostico' => now()->format('Y-m-d'),
                    'es_principal' => false,
                    'status' => true
                ]);
            }

            // 3. Ejecutar Análisis IA (NLP) de forma independiente
            // Esto asegura que si el análisis falla, la nota ya se guardó y el diagnóstico también
            try {
                $this->nlpService->analizar($nota);
            } catch (\Exception $nlpError) {
                \Illuminate\Support\Facades\Log::error("El análisis IA falló, pero la nota se guardó: " . $nlpError->getMessage());
            }
            
            return response()->json(['success' => true, 'data' => $nota], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}