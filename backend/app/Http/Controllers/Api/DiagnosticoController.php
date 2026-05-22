<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Diagnostico\StoreDiagnosticoRequest;
use App\Http\Requests\Diagnostico\UpdateDiagnosticoRequest;
use App\Http\Resources\DiagnosticoResource;
use App\Models\Diagnostico;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * DiagnosticoController
 *
 * Gestiona el historial de diagnósticos clínicos de un paciente.
 * Las rutas son anidadas bajo /pacientes/{paciente}/diagnosticos.
 *
 * Regla de diagnóstico principal:
 * Un paciente solo puede tener un diagnóstico marcado como principal
 * activo en un momento dado. Al marcar uno nuevo como principal,
 * todos los anteriores del mismo paciente pierden esa condición
 * automáticamente (sin necesidad de que el psicólogo lo haga manualmente).
 */
class DiagnosticoController extends Controller
{
    /**
     * Verifica que el paciente exista y pertenezca al psicólogo autenticado.
     */
    private function obtenerPaciente(int $pacienteId): ?Paciente
    {
        return Paciente::where('id', $pacienteId)
            ->where('user_id', auth()->id())
            ->where('status', true)
            ->first();
    }

    /**
     * Listado de diagnósticos activos de un paciente.
     * Ordenados por fecha descendente (el más reciente primero)
     * y con el principal al tope.
     *
     * GET /api/v1/pacientes/{paciente}/diagnosticos
     */
    public function index(int $pacienteId): JsonResponse|AnonymousResourceCollection
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $diagnosticos = Diagnostico::where('paciente_id', $pacienteId)
            ->where('status', true)
            ->with(['psicologo', 'creador'])
            ->orderByDesc('es_principal')   // Principal primero
            ->orderByDesc('fecha_diagnostico')
            ->get();

        return DiagnosticoResource::collection($diagnosticos);
    }

    /**
     * Detalle de un diagnóstico específico.
     *
     * GET /api/v1/pacientes/{paciente}/diagnosticos/{diagnostico}
     */
    public function show(int $pacienteId, int $diagnosticoId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $diagnostico = Diagnostico::where('id', $diagnosticoId)
            ->where('paciente_id', $pacienteId)
            ->where('status', true)
            ->with(['psicologo', 'creador'])
            ->first();

        if (! $diagnostico) {
            return response()->json(['message' => 'Diagnóstico no encontrado.'], 404);
        }

        return response()->json([
            'data' => new DiagnosticoResource($diagnostico),
        ], 200);
    }

    /**
     * Registrar un nuevo diagnóstico para el paciente.
     *
     * Si se marca como principal (es_principal = true), se desmarcan
     * automáticamente todos los diagnósticos anteriores del paciente.
     *
     * POST /api/v1/pacientes/{paciente}/diagnosticos
     */
    public function store(StoreDiagnosticoRequest $request, int $pacienteId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $esPrincipal = $request->boolean('es_principal', false);

        // Si el nuevo diagnóstico es principal, quitamos ese estado
        // a todos los diagnósticos anteriores del paciente
        if ($esPrincipal) {
            $this->desmarcarPrincipalAnterior($pacienteId);
        }

        $diagnostico = Diagnostico::create([
            ...$request->validated(),
            'paciente_id'  => $pacienteId,
            'user_id'      => auth()->id(),
            'es_principal' => $esPrincipal,
            'status'       => true,
        ]);

        $diagnostico->load(['psicologo', 'creador']);

        return response()->json([
            'message' => 'Diagnóstico registrado correctamente.',
            'data'    => new DiagnosticoResource($diagnostico),
        ], 201);
    }

    /**
     * Actualizar un diagnóstico existente.
     *
     * Si se cambia es_principal a true, se aplica la misma
     * lógica de desmarcar anteriores.
     *
     * PUT /api/v1/pacientes/{paciente}/diagnosticos/{diagnostico}
     */
    public function update(
        UpdateDiagnosticoRequest $request,
        int $pacienteId,
        int $diagnosticoId
    ): JsonResponse {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $diagnostico = Diagnostico::where('id', $diagnosticoId)
            ->where('paciente_id', $pacienteId)
            ->where('status', true)
            ->first();

        if (! $diagnostico) {
            return response()->json(['message' => 'Diagnóstico no encontrado.'], 404);
        }

        // Si se está marcando como principal, desmarcamos los anteriores
        if ($request->boolean('es_principal', false) && ! $diagnostico->es_principal) {
            $this->desmarcarPrincipalAnterior($pacienteId);
        }

        $diagnostico->update($request->validated());
        $diagnostico->load(['psicologo', 'creador']);

        return response()->json([
            'message' => 'Diagnóstico actualizado correctamente.',
            'data'    => new DiagnosticoResource($diagnostico),
        ], 200);
    }

    /**
     * Desactivar un diagnóstico (soft delete lógico).
     *
     * Si el diagnóstico desactivado era el principal,
     * el paciente queda sin diagnóstico principal activo.
     * El psicólogo deberá marcar uno nuevo como principal.
     *
     * DELETE /api/v1/pacientes/{paciente}/diagnosticos/{diagnostico}
     */
    public function destroy(int $pacienteId, int $diagnosticoId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $diagnostico = Diagnostico::where('id', $diagnosticoId)
            ->where('paciente_id', $pacienteId)
            ->where('status', true)
            ->first();

        if (! $diagnostico) {
            return response()->json(['message' => 'Diagnóstico no encontrado.'], 404);
        }

        $eraPrincipal = $diagnostico->es_principal;
        $diagnostico->deactivate();

        return response()->json([
            'message' => $eraPrincipal
                ? 'Diagnóstico principal desactivado. Recuerde asignar un nuevo diagnóstico principal.'
                : 'Diagnóstico desactivado correctamente.',
        ], 200);
    }

    /**
     * Desmarca todos los diagnósticos principales activos de un paciente.
     * Se llama antes de marcar uno nuevo como principal.
     *
     * Método privado de apoyo — no es un endpoint.
     */
    private function desmarcarPrincipalAnterior(int $pacienteId): void
    {
        Diagnostico::where('paciente_id', $pacienteId)
            ->where('es_principal', true)
            ->where('status', true)
            ->update(['es_principal' => false]);
    }
}