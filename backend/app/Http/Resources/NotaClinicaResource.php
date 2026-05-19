<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * NotaClinicaResource
 *
 * Transforma el modelo NotaClinica al JSON que consume el frontend.
 * Incluye el análisis de sentimiento si ya fue procesado por el NLP.
 */
class NotaClinicaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'sesion_id'             => $this->sesion_id,

            // Formato SOAP
            'subjetivo'             => $this->subjetivo,
            'objetivo'              => $this->objetivo,
            'analisis'              => $this->analisis,
            'plan'                  => $this->plan,

            // Nota libre y complementos
            'contenido'             => $this->contenido,
            'tecnicas_utilizadas'   => $this->tecnicas_utilizadas,
            'tareas_asignadas'      => $this->tareas_asignadas,
            'observaciones'         => $this->observaciones,

            // Análisis de sentimiento (se carga cuando exista)
            'analisis_sentimiento'  => $this->whenLoaded(
                'analisisSentimiento',
                fn() => $this->analisisSentimiento ? [
                    'label'     => $this->analisisSentimiento->label,
                    'score'     => $this->analisisSentimiento->score,
                    'estrellas' => $this->analisisSentimiento->estrellas,
                ] : null
            ),

            // Auditoría
            'status'                => $this->status,
            'created_at'            => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'            => $this->updated_at?->format('Y-m-d H:i:s'),
            'creado_por'            => $this->whenLoaded('creador',
                fn() => $this->creador?->name
            ),
        ];
    }
}