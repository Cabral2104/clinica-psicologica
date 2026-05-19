<?php

namespace App\Http\Requests\Sesion;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreSesionRequest
 *
 * Valida los datos para crear una nueva sesión.
 * El numero_sesion NO se valida aquí porque se calcula
 * automáticamente en el controlador.
 */
class StoreSesionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_sesion'            => ['required', 'date'],
            'hora_inicio'             => ['nullable', 'date_format:H:i'],
            'hora_fin'                => ['nullable', 'date_format:H:i', 'after:hora_inicio'],
            'duracion_minutos'        => ['nullable', 'integer', 'min:1', 'max:480'],
            'tipo_sesion_id'          => ['required', 'integer', 'exists:catalogos,id'],
            'estado_sesion_id'        => ['required', 'integer', 'exists:catalogos,id'],
            'observaciones_generales' => ['nullable', 'string'],
            'costo'                   => ['nullable', 'numeric', 'min:0'],
            'pagada'                  => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_sesion.required'   => 'La fecha de la sesión es obligatoria.',
            'fecha_sesion.date'       => 'El formato de la fecha no es válido.',
            'hora_fin.after'          => 'La hora de fin debe ser posterior a la hora de inicio.',
            'tipo_sesion_id.required' => 'El tipo de sesión es obligatorio.',
            'tipo_sesion_id.exists'   => 'El tipo de sesión seleccionado no es válido.',
            'estado_sesion_id.required' => 'El estado de la sesión es obligatorio.',
        ];
    }
}