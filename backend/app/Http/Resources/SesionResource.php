<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SesionResource
 *
 * Transforma el modelo Sesion al JSON que consume el frontend.
 * Incluye la nota clínica cuando está disponible.
 */
class SesionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'paciente_id'            => $this->paciente_id,
            'numero_sesion'          => $this->numero_sesion,
            'fecha_sesion'           => $this->fecha_sesion?->format('Y-m-d'),
            'hora_inicio'            => $this->hora_inicio,
            'hora_fin'               => $this->hora_fin,
            'duracion_minutos'       => $this->duracion_minutos,

            // Catálogos
            'tipo_sesion'            => $this->whenLoaded('tipoSesion', fn() => [
                'id'    => $this->tipoSesion->id,
                'clave' => $this->tipoSesion->clave,
                'valor' => $this->tipoSesion->valor,
            ]),
            'estado_sesion'          => $this->whenLoaded('estadoSesion', fn() => [
                'id'    => $this->estadoSesion->id,
                'clave' => $this->estadoSesion->clave,
                'valor' => $this->estadoSesion->valor,
            ]),

            'observaciones_generales' => $this->observaciones_generales,
            'costo'                  => $this->costo,
            'pagada'                 => $this->pagada,

            // Nota clínica (solo cuando se carga explícitamente)
            'nota'                   => $this->whenLoaded('nota',
                fn() => $this->nota
                    ? new NotaClinicaResource($this->nota)
                    : null
            ),

            // Indica si la sesión ya tiene nota escrita
            'tiene_nota'             => $this->whenLoaded('nota',
                fn() => $this->nota !== null
            ),

            // Auditoría
            'status'                 => $this->status,
            'created_at'             => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'             => $this->updated_at?->format('Y-m-d H:i:s'),
            'creado_por'             => $this->whenLoaded('creador',
                fn() => $this->creador?->name
            ),
        ];
    }
}