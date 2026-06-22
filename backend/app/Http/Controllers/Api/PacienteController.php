<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Paciente\StorePacienteRequest;
use App\Http\Requests\Paciente\UpdatePacienteRequest;
use App\Http\Resources\PacienteResource;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * PacienteController
 *
 * CRUD completo de pacientes para el psicólogo autenticado.
 *
 * Regla de propiedad: un psicólogo solo puede ver y gestionar
 * los pacientes que él mismo registró (user_id = auth()->id()).
 *
 * El borrado es lógico: status = 0 (nunca se elimina el registro).
 */
class PacienteController extends Controller
{
    /**
     * Listado de pacientes del psicólogo autenticado.
     *
     * Soporta:
     *   - Búsqueda por nombre, apellidos o email (?buscar=texto)
     *   - Filtro por estado (?estado=activo|alta|baja)
     *   - Paginación (?por_pagina=15)
     *
     * GET /api/v1/pacientes
     */
    public function index()
    {
        try {
            // 1. Usamos la ruta absoluta \App\Models\Paciente para evitar errores si falta el "use" arriba
            $pacientes = \App\Models\Paciente::where('user_id', auth()->id())
                                 ->orderBy('created_at', 'desc')
                                 ->get();

            // 2. Restauramos el uso de tu Resource para que Laravel parsee los datos correctamente
            return \App\Http\Resources\PacienteResource::collection($pacientes);

        } catch (\Exception $e) {
            // Si Laravel falla, ya no mandará un 500 en blanco, nos dirá la línea y el motivo exacto
            return response()->json([
                'success' => false,
                'message' => 'Error al cargar pacientes',
                'error_real' => $e->getMessage(),
                'linea' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Detalle completo de un paciente.
     *
     * Carga todas las relaciones necesarias para la vista de expediente:
     * catálogos, contactos de emergencia y diagnósticos activos.
     *
     * GET /api/v1/pacientes/{paciente}
     */
    public function show(int $id): JsonResponse
    {
        $paciente = Paciente::where('user_id', auth()->id())
            ->where('status', true)
            ->with([
                'genero',
                'estadoCivil',
                'escolaridad',
                'estadoPaciente',
                'contactosEmergencia' => fn($q) => $q->where('status', true),
                'diagnosticos'        => fn($q) => $q->where('status', true)->orderByDesc('fecha_diagnostico'),
                'sesiones'            => fn($q) => $q->where('status', true),
                'creador',
            ])
            ->find($id);

        if (! $paciente) {
            return response()->json([
                'message' => 'Paciente no encontrado.',
            ], 404);
        }

        return response()->json([
            'data' => new PacienteResource($paciente),
        ], 200);
    }

    /**
     * Registrar un nuevo paciente.
     *
     * Asigna automáticamente el psicólogo autenticado como responsable.
     * Los campos de auditoría (created_by, updated_by) se llenan
     * automáticamente mediante el Trait Auditable.
     *
     * POST /api/v1/pacientes
     */
    public function store(StorePacienteRequest $request): JsonResponse
    {
        $paciente = Paciente::create([
            ...$request->validated(),
            'user_id' => auth()->id(),
            'status'  => true,
        ]);

        // Cargamos relaciones para devolver el recurso completo
        $paciente->load(['genero', 'estadoPaciente']);

        return response()->json([
            'message' => 'Paciente registrado correctamente.',
            'data'    => new PacienteResource($paciente),
        ], 201);
    }

    /**
     * Actualizar datos de un paciente.
     *
     * Solo el psicólogo propietario puede modificarlo.
     * Se usa 'sometimes' en el Request para permitir
     * actualizaciones parciales.
     *
     * PUT /api/v1/pacientes/{paciente}
     */
    public function update(UpdatePacienteRequest $request, int $id): JsonResponse
    {
        $paciente = Paciente::where('user_id', auth()->id())
            ->where('status', true)
            ->find($id);

        if (! $paciente) {
            return response()->json([
                'message' => 'Paciente no encontrado.',
            ], 404);
        }

        $paciente->update($request->validated());
        $paciente->load(['genero', 'estadoCivil', 'escolaridad', 'estadoPaciente']);

        return response()->json([
            'message' => 'Paciente actualizado correctamente.',
            'data'    => new PacienteResource($paciente),
        ], 200);
    }

    /**
     * Desactivar un paciente (soft delete lógico).
     *
     * NO elimina el registro. Cambia status a false (0).
     * El expediente queda preservado por razones legales y de auditoría.
     *
     * DELETE /api/v1/pacientes/{paciente}
     */
    public function destroy(int $id): JsonResponse
    {
        $paciente = Paciente::where('user_id', auth()->id())
            ->where('status', true)
            ->find($id);

        if (! $paciente) {
            return response()->json([
                'message' => 'Paciente no encontrado.',
            ], 404);
        }

        // Usamos el método del Trait Auditable
        $paciente->deactivate();

        return response()->json([
            'message' => 'Paciente desactivado correctamente.',
        ], 200);
    }

    public function toggleStatus($id)
    {
        try {
            $paciente = \App\Models\Paciente::where('user_id', auth()->id())->findOrFail($id);
            $paciente->status = !$paciente->status;
            $paciente->save();

            return response()->json([
                'success' => true, 
                'message' => 'Estado del paciente actualizado',
                'data' => $paciente
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar estado',
                'error_real' => $e->getMessage()
            ], 500);
        }
    }
}