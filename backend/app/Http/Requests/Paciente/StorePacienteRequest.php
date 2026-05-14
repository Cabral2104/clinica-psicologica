<?php

namespace App\Http\Requests\Paciente;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StorePacienteRequest
 *
 * Valida los datos requeridos para registrar un nuevo paciente.
 * Los campos marcados como 'nullable' son opcionales en el formulario.
 */
class StorePacienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Datos personales — obligatorios
            'nombre'                => ['required', 'string', 'max:100'],
            'apellido_paterno'      => ['required', 'string', 'max:100'],
            'apellido_materno'      => ['nullable', 'string', 'max:100'],
            'fecha_nacimiento'      => ['required', 'date', 'before:today'],
            'lugar_nacimiento'      => ['nullable', 'string', 'max:150'],
            'curp'                  => ['nullable', 'string', 'size:18', 'unique:pacientes,curp'],

            // Catálogos — genero y estado_paciente son obligatorios
            'genero_id'             => ['required', 'integer', 'exists:catalogos,id'],
            'estado_civil_id'       => ['nullable', 'integer', 'exists:catalogos,id'],
            'escolaridad_id'        => ['nullable', 'integer', 'exists:catalogos,id'],
            'estado_paciente_id'    => ['required', 'integer', 'exists:catalogos,id'],

            // Contacto
            'telefono'              => ['nullable', 'string', 'max:20'],
            'celular'               => ['nullable', 'string', 'max:20'],
            'email'                 => ['nullable', 'email', 'max:150'],

            // Dirección
            'calle'                 => ['nullable', 'string', 'max:200'],
            'colonia'               => ['nullable', 'string', 'max:150'],
            'ciudad'                => ['nullable', 'string', 'max:100'],
            'estado_geo'            => ['nullable', 'string', 'max:100'],
            'codigo_postal'         => ['nullable', 'string', 'max:10'],

            // Laborales
            'ocupacion'             => ['nullable', 'string', 'max:150'],
            'lugar_trabajo'         => ['nullable', 'string', 'max:200'],

            // Clínicos
            'motivo_consulta'           => ['required', 'string'],
            'antecedentes_personales'   => ['nullable', 'string'],
            'antecedentes_familiares'   => ['nullable', 'string'],
            'medicacion_actual'         => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'           => 'El nombre es obligatorio.',
            'apellido_paterno.required' => 'El apellido paterno es obligatorio.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.before'   => 'La fecha de nacimiento debe ser anterior a hoy.',
            'curp.size'                 => 'La CURP debe tener exactamente 18 caracteres.',
            'curp.unique'               => 'Esta CURP ya está registrada.',
            'genero_id.required'        => 'El género es obligatorio.',
            'genero_id.exists'          => 'El género seleccionado no es válido.',
            'estado_paciente_id.required' => 'El estado del paciente es obligatorio.',
            'motivo_consulta.required'  => 'El motivo de consulta es obligatorio.',
        ];
    }
}