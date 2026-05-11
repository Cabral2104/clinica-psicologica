<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * LoginRequest
 *
 * Valida las credenciales enviadas desde el frontend antes de
 * que lleguen al controlador. Si la validación falla, Laravel
 * responde automáticamente con 422 y los mensajes de error.
 *
 * Separar la validación del controlador mantiene el código limpio
 * y permite reutilizar esta clase en otros flujos si fuera necesario.
 */
class LoginRequest extends FormRequest
{
    /**
     * Cualquier usuario puede intentar autenticarse.
     * La autorización real se maneja en el controlador.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación del formulario de login.
     */
    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    /**
     * Mensajes de error en español.
     */
    public function messages(): array
    {
        return [
            'email.required'    => 'El correo electrónico es obligatorio.',
            'email.email'       => 'El formato del correo no es válido.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min'      => 'La contraseña debe tener al menos 8 caracteres.',
        ];
    }
}