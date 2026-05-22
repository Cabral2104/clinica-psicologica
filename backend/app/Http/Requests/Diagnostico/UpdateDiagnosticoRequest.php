<?php

namespace App\Http\Requests\Diagnostico;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateDiagnosticoRequest
 *
 * Igual que Store pero con 'sometimes' para actualizaciones parciales.
 */
class UpdateDiagnosticoRequest extends FormRequest
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
            'nombre_diagnostico' => ['sometimes', 'required', 'string', 'max:300'],
            'descripcion'        => ['nullable', 'string'],
            'fecha_diagnostico'  => ['sometimes', 'required', 'date', 'before_or_equal:today'],
            'es_principal'       => ['nullable', 'boolean'],
        ];
    }
}