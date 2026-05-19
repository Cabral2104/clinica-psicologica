<?php

namespace App\Http\Requests\Sesion;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateSesionRequest
 *
 * Igual que Store pero con 'sometimes' para actualizaciones parciales.
 */
class UpdateSesionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_sesion'            => ['sometimes', 'required', 'date'],
            'hora_inicio'             => ['nullable', 'date_format:H:i'],
            'hora_fin'                => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'duracion_minutos'        => ['nullable', 'integer', 'min:1', 'max:480'],
            'tipo_sesion_id'          => ['sometimes', 'required', 'integer', 'exists:catalogos,id'],
            'estado_sesion_id'        => ['sometimes', 'required', 'integer', 'exists:catalogos,id'],
            'observaciones_generales' => ['nullable', 'string'],
            'costo'                   => ['nullable', 'numeric', 'min:0'],
            'pagada'                  => ['nullable', 'boolean'],
        ];
    }
}