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
use Barryvdh\DomPDF\Facade\Pdf;

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
    public function index(\Illuminate\Http\Request $request)
    {
        try {
            $query = \App\Models\Paciente::where('user_id', auth()->id());

            // 1. Buscador Real (Backend Search)
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'LIKE', "%{$search}%")
                      ->orWhere('apellido_paterno', 'LIKE', "%{$search}%")
                      ->orWhere('apellido_materno', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // 2. Paginación Inteligente
            // Si el frontend manda "?page=X", paginamos de 8 en 8. 
            // Si no (como en tu vista anterior de Pacientes), devuelve todos.
            if ($request->has('page')) {
                $pacientes = $query->orderBy('created_at', 'desc')->paginate(8);
            } else {
                $pacientes = $query->orderBy('created_at', 'desc')->get();
            }

            // Usamos tu Resource para mantener el formato limpio
            return \App\Http\Resources\PacienteResource::collection($pacientes);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error al cargar pacientes', 
                'error_real' => $e->getMessage()
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

    public function showExpediente($id)
    {
        try {
            $paciente = \App\Models\Paciente::with([
                'genero',               // <-- Agregamos el catálogo de género
                'contactosEmergencia', 
                'diagnosticos',
                'sesiones' => function($query) {
                    $query->orderBy('fecha_sesion', 'desc');
                },
                'sesiones.tipoSesion',
                'sesiones.estadoSesion',
                'sesiones.nota.analisisSentimiento'
            ])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $paciente
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Error SQL: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportarPdf($id)
    {
        try {
            $paciente = \App\Models\Paciente::with([
                'genero',
                'contactosEmergencia',
                'diagnosticos' => function($q) { $q->orderBy('fecha_diagnostico', 'desc'); },
                'sesiones' => function($q) { $q->orderBy('fecha_sesion', 'asc'); },
                'sesiones.nota.analisisSentimiento'
            ])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

            // Cargamos una vista HTML (que crearemos en el siguiente paso) y le pasamos los datos
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.expediente', compact('paciente'));
            
            // Retornamos el archivo PDF para descarga
            return $pdf->download('Expediente_' . $paciente->id . '.pdf');

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al generar PDF: ' . $e->getMessage()], 500);
        }
    }
}