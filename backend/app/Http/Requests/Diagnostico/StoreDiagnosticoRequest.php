<?php

namespace App\Http\Requests\Diagnostico;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreDiagnosticoRequest
 *
 * Valida los datos para registrar un nuevo diagnóstico.
 * Al menos uno de los dos códigos (CIE o DSM) debe estar presente,
 * pero ambos son opcionales individualmente para flexibilidad clínica.
 */
class StoreDiagnosticoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo_cie'         => ['nullable', 'string', 'max:20'],
            'codigo_dsm'         => ['nullable', 'string', 'max:20'],
            'nombre_diagnostico' => ['required', 'string', 'max:300'],
            'descripcion'        => ['nullable', 'string'],
            'fecha_diagnostico'  => ['required', 'date', 'before_or_equal:today'],
            'es_principal'       => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_diagnostico.required' => 'El nombre del diagnóstico es obligatorio.',
            'fecha_diagnostico.required'  => 'La fecha del diagnóstico es obligatoria.',
            'fecha_diagnostico.before_or_equal' => 'La fecha del diagnóstico no puede ser futura.',
        ];
    }
}