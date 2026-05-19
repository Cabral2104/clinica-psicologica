<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotaClinica\StoreNotaRequest;
use App\Http\Resources\NotaClinicaResource;
use App\Models\NotaClinica;
use App\Models\Sesion;
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
 * - Al guardar la nota, se dispara automáticamente el análisis NLP
 */
class NotaClinicaController extends Controller
{
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
     * Si la sesión ya tiene nota → la actualiza.
     * Si no tiene nota → la crea.
     *
     * Esto simplifica el frontend: siempre hace POST al mismo endpoint,
     * sin importar si es creación o edición.
     *
     * POST /api/v1/sesiones/{sesion}/nota
     */
    public function store(StoreNotaRequest $request, int $sesionId): JsonResponse
    {
        $sesion = $this->obtenerSesion($sesionId);

        if (! $sesion) {
            return response()->json(['message' => 'Sesión no encontrada.'], 404);
        }

        // Upsert: actualiza si existe, crea si no existe
        $nota = NotaClinica::updateOrCreate(
            ['sesion_id' => $sesionId],
            [
                ...$request->validated(),
                'status' => true,
            ]
        );

        // Indicamos si fue creación o actualización para el mensaje
        $esNueva = $nota->wasRecentlyCreated;

        $nota->load(['analisisSentimiento', 'creador']);

        return response()->json([
            'message' => $esNueva
                ? 'Nota clínica registrada correctamente.'
                : 'Nota clínica actualizada correctamente.',
            'data'    => new NotaClinicaResource($nota),
        ], $esNueva ? 201 : 200);
    }
}