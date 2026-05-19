<?php

namespace App\Http\Requests\NotaClinica;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreNotaRequest
 *
 * Valida los datos de una nota clínica.
 * El campo 'contenido' es obligatorio ya que es la nota libre general.
 * Los campos SOAP son opcionales para permitir distintos flujos de trabajo.
 *
 * Este mismo Request se usa para crear y para actualizar la nota
 * (una sesión solo tiene una nota — se hace upsert).
 */
class StoreNotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Formato SOAP (opcionales individualmente)
            'subjetivo'           => ['nullable', 'string'],
            'objetivo'            => ['nullable', 'string'],
            'analisis'            => ['nullable', 'string'],
            'plan'                => ['nullable', 'string'],

            // Nota libre — obligatoria
            'contenido'           => ['required', 'string', 'min:10'],

            // Complementos
            'tecnicas_utilizadas' => ['nullable', 'string'],
            'tareas_asignadas'    => ['nullable', 'string'],
            'observaciones'       => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'contenido.required' => 'El contenido de la nota es obligatorio.',
            'contenido.min'      => 'La nota debe tener al menos 10 caracteres.',
        ];
    }
}