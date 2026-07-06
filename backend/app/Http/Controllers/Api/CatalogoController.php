<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Catalogo;
use Illuminate\Http\JsonResponse;

/**
 * CatalogoController
 *
 * Expone los valores de la tabla `catalogos` para ser consumidos
 * por el frontend en formularios con dropdowns dinámicos.
 *
 * Los catálogos son de solo lectura desde la API.
 * Grupos disponibles:
 *   - genero
 *   - estado_civil
 *   - escolaridad
 *   - estado_paciente
 *   - tipo_sesion
 *   - estado_sesion
 */
class CatalogoController extends Controller
{
    /**
     * Lista todos los grupos de catálogos disponibles.
     *
     * Útil para que React sepa qué grupos existen sin hardcodearlos.
     *
     * GET /api/v1/catalogos
     *
     * Respuesta (200):
     * {
     *   "data": ["genero", "estado_civil", "escolaridad", ...]
     * }
     */
    public function index(): JsonResponse
    {
        $grupos = Catalogo::where('status', true)
            ->distinct()
            ->orderBy('grupo')
            ->pluck('grupo');

        return response()->json([
            'data' => $grupos,
        ], 200);
    }

    /**
     * Devuelve los valores de un grupo específico de catálogo.
     *
     * GET /api/v1/catalogos/{grupo}
     *
     * @param string $grupo  Nombre del grupo (ej: 'genero', 'tipo_sesion')
     *
     * Respuesta exitosa (200):
     * {
     *   "data": [
     *     { "id": 1, "clave": "M", "valor": "Masculino" },
     *     { "id": 2, "clave": "F", "valor": "Femenino" }
     *   ]
     * }
     *
     * Respuesta si el grupo no existe (404):
     * {
     *   "message": "Grupo de catálogo no encontrado."
     * }
     */
    public function porGrupo(string $grupo): JsonResponse
    {
        $catalogos = Catalogo::where('grupo', $grupo)
            ->where('status', true)
            ->orderBy('orden')
            ->get(['id', 'clave', 'valor']);

        if ($catalogos->isEmpty()) {
            return response()->json([
                'message' => 'Grupo de catálogo no encontrado.',
            ], 404);
        }

        return response()->json([
            'data' => $catalogos,
        ], 200);
    }

    public function buscarCie10(\Illuminate\Http\Request $request)
    {
        try {
            $search = $request->query('q');

            if (empty($search) || strlen($search) < 2) {
                return response()->json([]);
            }

            $resultados = \Illuminate\Support\Facades\DB::table('catalogo_cie10')
                ->where('activo', true)
                ->where(function($query) use ($search) {
                    $query->where('codigo', 'LIKE', "%{$search}%")
                          ->orWhere('descripcion', 'LIKE', "%{$search}%");
                })
                ->select('id', 'codigo', 'descripcion')
                ->limit(10)
                ->get();

            return response()->json($resultados);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}