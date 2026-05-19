<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * PacienteResource
 *
 * Define la estructura JSON que se devuelve al frontend
 * para un paciente. Incluye relaciones cargadas.
 */
class PacienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,

            // Datos personales
            'nombre'                => $this->nombre,
            'apellido_paterno'      => $this->apellido_paterno,
            'apellido_materno'      => $this->apellido_materno,
            'nombre_completo'       => $this->nombre_completo, // accessor del modelo
            'fecha_nacimiento'      => $this->fecha_nacimiento?->format('Y-m-d'),
            'edad'                  => $this->fecha_nacimiento?->age,
            'lugar_nacimiento'      => $this->lugar_nacimiento,
            'curp'                  => $this->curp,

            // Catálogos (se cargan con eager loading)
            'genero'                => $this->whenLoaded('genero', fn() => [
                'id'    => $this->genero->id,
                'clave' => $this->genero->clave,
                'valor' => $this->genero->valor,
            ]),
            'estado_civil'          => $this->whenLoaded('estadoCivil', fn() => [
                'id'    => $this->estadoCivil?->id,
                'clave' => $this->estadoCivil?->clave,
                'valor' => $this->estadoCivil?->valor,
            ]),
            'escolaridad'           => $this->whenLoaded('escolaridad', fn() => [
                'id'    => $this->escolaridad?->id,
                'clave' => $this->escolaridad?->clave,
                'valor' => $this->escolaridad?->valor,
            ]),
            'estado_paciente'       => $this->whenLoaded('estadoPaciente', fn() => [
                'id'    => $this->estadoPaciente->id,
                'clave' => $this->estadoPaciente->clave,
                'valor' => $this->estadoPaciente->valor,
            ]),

            // Contacto
            'telefono'              => $this->telefono,
            'celular'               => $this->celular,
            'email'                 => $this->email,

            // Dirección
            'direccion'             => [
                'calle'          => $this->calle,
                'colonia'        => $this->colonia,
                'ciudad'         => $this->ciudad,
                'estado'         => $this->estado_geo,
                'codigo_postal'  => $this->codigo_postal,
            ],

            // Datos laborales
            'ocupacion'             => $this->ocupacion,
            'lugar_trabajo'         => $this->lugar_trabajo,

            // Clínicos
            'motivo_consulta'       => $this->motivo_consulta,
            'antecedentes_personales' => $this->antecedentes_personales,
            'antecedentes_familiares' => $this->antecedentes_familiares,
            'medicacion_actual'     => $this->medicacion_actual,

            // Relaciones opcionales (solo en detalle)
            'contactos_emergencia'  => $this->whenLoaded('contactosEmergencia'),
            'diagnosticos'          => $this->whenLoaded('diagnosticos'),

            // Estadísticas rápidas
            'total_sesiones'        => $this->whenLoaded('sesiones',
                fn() => $this->sesiones->count()
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