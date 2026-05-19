<?php

namespace App\Http\Requests\Paciente;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdatePacienteRequest
 *
 * Similar a StorePacienteRequest pero con 'sometimes' para que
 * solo se validen los campos que se envíen en la petición.
 * Esto permite actualizaciones parciales (PATCH).
 *
 * La validación unique de CURP ignora el registro actual del paciente
 * para que no falle si se actualiza sin cambiar la CURP.
 */
class UpdatePacienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Obtenemos el ID del paciente desde la ruta: /pacientes/{paciente}
        $pacienteId = $this->route('paciente');

        return [
            'nombre'                => ['sometimes', 'required', 'string', 'max:100'],
            'apellido_paterno'      => ['sometimes', 'required', 'string', 'max:100'],
            'apellido_materno'      => ['nullable', 'string', 'max:100'],
            'fecha_nacimiento'      => ['sometimes', 'required', 'date', 'before:today'],
            'lugar_nacimiento'      => ['nullable', 'string', 'max:150'],
            'curp'                  => [
                'nullable', 'string', 'size:18',
                "unique:pacientes,curp,{$pacienteId}",  // Ignora el registro actual
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