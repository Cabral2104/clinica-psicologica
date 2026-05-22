<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
    public function store(StoreNotaRequest $request, int $sesionId): JsonResponse
    {
        $sesion = $this->obtenerSesion($sesionId);

        if (! $sesion) {
            return response()->json(['message' => 'Sesión no encontrada.'], 404);
        }

        // Paso 1: Guardar o actualizar la nota (upsert)
        $nota = NotaClinica::updateOrCreate(
            ['sesion_id' => $sesionId],
            [
                ...$request->validated(),
                'status' => true,
            ]
        );

        $esNueva = $nota->wasRecentlyCreated;

        // Paso 2: Enviar al NLP para análisis (no bloqueante)
        // Si falla, el error queda en el log pero la nota está guardada
        $this->nlpService->analizar($nota);

        // Paso 3: Recargar la nota con el análisis recién guardado
        $nota->load(['analisisSentimiento', 'creador']);

        return response()->json([
            'message' => $esNueva
                ? 'Nota clínica registrada correctamente.'
                : 'Nota clínica actualizada correctamente.',
            'data'    => new NotaClinicaResource($nota),
            'nlp'     => $nota->analisisSentimiento
                ? 'Análisis de sentimiento completado.'
                : 'Análisis de sentimiento no disponible en este momento.',
        ], $esNueva ? 201 : 200);
    }
}