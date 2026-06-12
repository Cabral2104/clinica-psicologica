<?php

namespace App\Http\Requests\Paciente;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePacienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el paciente de la ruta
        $paciente = $this->route('paciente');
        
        // Extraemos solo el ID para evitar que el 'unique' colapse
        $pacienteId = is_object($paciente) ? $paciente->id : $paciente;

        return [
            'nombre'                => ['sometimes', 'required', 'string', 'max:100'],
            'apellido_paterno'      => ['sometimes', 'required', 'string', 'max:100'],
            'apellido_materno'      => ['nullable', 'string', 'max:100'],
            'fecha_nacimiento'      => ['sometimes', 'required', 'date', 'before:today'],
            'lugar_nacimiento'      => ['nullable', 'string', 'max:150'],
            'curp'                  => [
                'nullable', 'string', 'size:18',
                "unique:pacientes,curp,{$pacienteId}",  // Ya tiene el ID limpio
            ],
            'genero_id'             => ['sometimes', 'required', 'integer', 'exists:catalogos,id'],
            'estado_civil_id'       => ['nullable', 'integer', 'exists:catalogos,id'],
            'escolaridad_id'        => ['nullable', 'integer', 'exists:catalogos,id'],
            'estado_paciente_id'    => ['sometimes', 'required', 'integer', 'exists:catalogos,id'],
            'telefono'              => ['nullable', 'string', 'max:20'],
            'celular'               => ['nullable', 'string', 'max:20'],
            'email'                 => ['nullable', 'email', 'max:150'],
            'calle'                 => ['nullable', 'string', 'max:200'],
            'colonia'               => ['nullable', 'string', 'max:150'],
            'ciudad'                => ['nullable', 'string', 'max:100'],
            'estado_geo'            => ['nullable', 'string', 'max:100'],
            'codigo_postal'         => ['nullable', 'string', 'max:10'],
            'ocupacion'             => ['nullable', 'string', 'max:150'],
            'lugar_trabajo'         => ['nullable', 'string', 'max:200'],
            'motivo_consulta'       => ['sometimes', 'required', 'string'],
            'antecedentes_personales'   => ['nullable', 'string'],
            'antecedentes_familiares'   => ['nullable', 'string'],
            'medicacion_actual'         => ['nullable', 'string'],
        ];
    }
}