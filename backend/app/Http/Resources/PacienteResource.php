<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'nombre_completo'       => $this->nombre_completo,
            'fecha_nacimiento'      => $this->fecha_nacimiento?->format('Y-m-d'),
            'edad'                  => $this->fecha_nacimiento?->age,
            'lugar_nacimiento'      => $this->lugar_nacimiento,
            'curp'                  => $this->curp,

            // Agregamos explícitamente los IDs de los catálogos para facilitar la edición
            'genero_id'             => $this->genero_id,
            'estado_civil_id'       => $this->estado_civil_id,
            'escolaridad_id'        => $this->escolaridad_id,
            'estado_paciente_id'    => $this->estado_paciente_id,

            // Catálogos
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

            'telefono'              => $this->telefono,
            'celular'               => $this->celular,
            'email'                 => $this->email,

            'direccion'             => [
                'calle'          => $this->calle,
                'colonia'        => $this->colonia,
                'ciudad'         => $this->ciudad,
                'estado'         => $this->estado_geo,
                'codigo_postal'  => $this->codigo_postal,
            ],

            'ocupacion'             => $this->ocupacion,
            'lugar_trabajo'         => $this->lugar_trabajo,

            'motivo_consulta'       => $this->motivo_consulta,
            'antecedentes_personales' => $this->antecedentes_personales,
            'antecedentes_familiares' => $this->antecedentes_familiares,
            'medicacion_actual'     => $this->medicacion_actual,

            'contactos_emergencia'  => $this->whenLoaded('contactosEmergencia'),
            'diagnosticos'          => $this->whenLoaded('diagnosticos'),

            'total_sesiones'        => $this->whenLoaded('sesiones',
                fn() => $this->sesiones->count()
            ),

            'status'                => $this->status,
            'created_at'            => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'            => $this->updated_at?->format('Y-m-d H:i:s'),
            'creado_por'            => $this->whenLoaded('creador',
                fn() => $this->creador?->name
            ),
        ];
    }
}