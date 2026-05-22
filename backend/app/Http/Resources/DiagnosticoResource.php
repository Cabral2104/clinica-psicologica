<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * DiagnosticoResource
 *
 * Transforma el modelo Diagnostico al JSON que consume el frontend.
 * Incluye el psicólogo que emitió el diagnóstico para trazabilidad.
 */
class DiagnosticoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'paciente_id'        => $this->paciente_id,

            // Clasificación internacional
            'codigo_cie'         => $this->codigo_cie,
            'codigo_dsm'         => $this->codigo_dsm,
            'nombre_diagnostico' => $this->nombre_diagnostico,
            'descripcion'        => $this->descripcion,
            'fecha_diagnostico'  => $this->fecha_diagnostico?->format('Y-m-d'),
            'es_principal'       => $this->es_principal,

            // Psicólogo que emitió el diagnóstico
            'emitido_por'        => $this->whenLoaded('psicologo',
                fn() => $this->psicologo?->name
            ),

            // Auditoría
            'status'             => $this->status,
            'created_at'         => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'         => $this->updated_at?->format('Y-m-d H:i:s'),
            'creado_por'         => $this->whenLoaded('creador',
                fn() => $this->creador?->name
            ),
        ];
    }
}