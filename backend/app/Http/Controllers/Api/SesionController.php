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
    public function index($pacienteId)
    {
        try {
            // 1. Verificamos que el paciente exista y le pertenezca al psicólogo
            $paciente = \App\Models\Paciente::where('user_id', auth()->id())->findOrFail($pacienteId);

            // 2. Buscamos las sesiones usando get() en lugar de firstOrFail()
            // Si no hay sesiones, get() devuelve una colección vacía [], lo cual es lo correcto.
            $sesiones = \App\Models\Sesion::with(['tipoSesion', 'estadoSesion', 'nota'])
                ->where('paciente_id', $paciente->id)
                ->orderBy('fecha_sesion', 'desc')
                ->orderBy('hora_inicio', 'desc')
                ->get();

            // 3. Devolvemos un 200 OK siempre, aunque el arreglo esté vacío
            return response()->json([
                'success' => true,
                'data' => $sesiones
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Este 404 SOLO debe saltar si el PACIENTE no existe o es de otro psicólogo
            return response()->json([
                'success' => false, 
                'message' => 'Paciente no encontrado o no tienes permisos'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error al cargar el historial de sesiones',
                'error' => $e->getMessage()
            ], 500);
        }
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
    public function proximas(\Illuminate\Http\Request $request)
    {
        $query = \App\Models\Sesion::with([
                'paciente', 
                'tipoSesion', 
                'estadoSesion'
            ])
            ->where('status', true);

        // Si React nos manda un rango de fechas visible (FullCalendar)
        if ($request->has('start') && $request->has('end')) {
            // Extraemos solo el YYYY-MM-DD del formato ISO que manda FullCalendar
            $start = substr($request->input('start'), 0, 10);
            $end = substr($request->input('end'), 0, 10);
            
            $query->whereBetween('fecha_sesion', [$start, $end]);
        } else {
            // Comportamiento original (ej. para la campana de notificaciones)
            $query->whereDate('fecha_sesion', '>=', now()->toDateString());
        }

        $sesiones = $query->orderBy('fecha_sesion', 'asc')
                          ->orderBy('hora_inicio', 'asc')
                          ->get();

        return response()->json([
            'success' => true,
            'data'    => $sesiones
        ]);
    }
}