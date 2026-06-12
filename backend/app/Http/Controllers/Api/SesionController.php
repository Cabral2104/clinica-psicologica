<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sesion\StoreSesionRequest;
use App\Http\Requests\Sesion\UpdateSesionRequest;
use App\Http\Resources\SesionResource;
use App\Models\Paciente;
use App\Models\Sesion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * SesionController
 *
 * Gestiona las sesiones clínicas de un paciente específico.
 * Las rutas son anidadas bajo /pacientes/{paciente}/sesiones
 * para reflejar la relación padre-hijo en la URL.
 *
 * Reglas de negocio:
 * - Solo el psicólogo propietario del paciente puede gestionar sus sesiones.
 * - El número de sesión se calcula automáticamente (consecutivo por paciente).
 * - Las sesiones desactivadas no aparecen en el listado.
 */
class SesionController extends Controller
{
    /**
     * Verifica que el paciente pertenezca al psicólogo autenticado.
     * Se usa internamente en todos los métodos del controlador.
     */
    private function obtenerPaciente(int $pacienteId): ?Paciente
    {
        return Paciente::where('id', $pacienteId)
            ->where('user_id', auth()->id())
            ->where('status', true)
            ->first();
    }

    /**
     * Listado de sesiones de un paciente.
     *
     * GET /api/v1/pacientes/{paciente}/sesiones
     */
    public function index(Request $request, int $pacienteId): JsonResponse|AnonymousResourceCollection
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $sesiones = Sesion::where('paciente_id', $pacienteId)
            ->where('status', true)
            // CAMBIO AQUÍ: Cargamos anidada la relación camelCase tal cual la definiste en el modelo
            ->with(['tipoSesion', 'estadoSesion', 'nota.analisisSentimiento'])
            ->orderByDesc('fecha_sesion')
            ->get();

        return SesionResource::collection($sesiones);
    }

    /**
     * Detalle de una sesión con su nota clínica.
     *
     * GET /api/v1/pacientes/{paciente}/sesiones/{sesion}
     */
    public function show(int $pacienteId, int $sesionId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $sesion = Sesion::where('id', $sesionId)
            ->where('paciente_id', $pacienteId)
            ->where('status', true)
            ->with([
                'tipoSesion',
                'estadoSesion',
                'nota.analisisSentimiento',
                'creador',
            ])
            ->first();

        if (! $sesion) {
            return response()->json(['message' => 'Sesión no encontrada.'], 404);
        }

        return response()->json([
            'data' => new SesionResource($sesion),
        ], 200);
    }

    /**
     * Crear una nueva sesión para el paciente.
     *
     * El número de sesión se calcula automáticamente tomando
     * el máximo actual del paciente y sumando 1.
     *
     * POST /api/v1/pacientes/{paciente}/sesiones
     */
    public function store(StoreSesionRequest $request, int $pacienteId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        // Calcular el número de sesión automáticamente
        $ultimoNumero = Sesion::where('paciente_id', $pacienteId)
            ->max('numero_sesion') ?? 0;

        $sesion = Sesion::create([
            ...$request->validated(),
            'paciente_id'    => $pacienteId,
            'user_id'        => auth()->id(),
            'numero_sesion'  => $ultimoNumero + 1,
            'status'         => true,
        ]);

        $sesion->load(['tipoSesion', 'estadoSesion', 'nota.analisisSentimiento']);

        return response()->json([
            'message' => 'Sesión registrada correctamente.',
            'data'    => new SesionResource($sesion),
        ], 201);
    }

    /**
     * Actualizar datos de una sesión.
     *
     * PUT /api/v1/pacientes/{paciente}/sesiones/{sesion}
     */
    public function update(UpdateSesionRequest $request, int $pacienteId, int $sesionId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $sesion = Sesion::where('id', $sesionId)
            ->where('paciente_id', $pacienteId)
            ->where('status', true)
            ->first();

        if (! $sesion) {
            return response()->json(['message' => 'Sesión no encontrada.'], 404);
        }

        $sesion->update($request->validated());
        $sesion->load(['tipoSesion', 'estadoSesion', 'nota.analisisSentimiento']);

        return response()->json([
            'message' => 'Sesión actualizada correctamente.',
            'data'    => new SesionResource($sesion),
        ], 200);
    }

    /**
     * Desactivar una sesión (soft delete lógico).
     *
     * DELETE /api/v1/pacientes/{paciente}/sesiones/{sesion}
     */
    public function destroy(int $pacienteId, int $sesionId): JsonResponse
    {
        $paciente = $this->obtenerPaciente($pacienteId);

        if (! $paciente) {
            return response()->json(['message' => 'Paciente no encontrado.'], 404);
        }

        $sesion = Sesion::where('id', $sesionId)
            ->where('paciente_id', $pacienteId)
            ->where('status', true)
            ->first();

        if (! $sesion) {
            return response()->json(['message' => 'Sesión no encontrada.'], 404);
        }

        $sesion->deactivate();

        return response()->json([
            'message' => 'Sesión desactivada correctamente.',
        ], 200);
    }

    // Próximas sesiones de todos los pacientes para mostrarlas en el calendario del psicólogo
    public function proximas()
    {
        // Consultamos las sesiones donde la fecha sea hoy o en el futuro
        $sesiones = \App\Models\Sesion::with([
                'paciente', // Cargamos los datos del paciente
                'tipoSesion', 
                'estadoSesion'
            ])
            ->whereDate('fecha_sesion', '>=', now()->toDateString())
            ->where('status', true) // Solo sesiones activas (no borradas)
            ->orderBy('fecha_sesion', 'asc') // Las más prontas primero
            ->orderBy('hora_inicio', 'asc')  // Ordenadas por hora dentro del mismo día
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $sesiones
        ]);
    }
}