<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * AuthController
 *
 * Gestiona el ciclo de vida de la autenticación:
 *   - login:  valida credenciales y emite un token Sanctum
 *   - me:     devuelve los datos del usuario autenticado
 *   - logout: revoca el token actual
 *
 * Todos los tokens son de tipo API (Sanctum), lo que significa
 * que no hay sesiones del lado del servidor — el estado vive
 * en el token que guarda React (localStorage o memoria).
 */
class AuthController extends Controller
{
    /**
     * Login del psicólogo.
     *
     * Recibe email y contraseña, verifica las credenciales
     * y devuelve un token Bearer si son correctas.
     *
     * @param  LoginRequest $request  Datos validados del formulario
     * @return JsonResponse
     *
     * Respuesta exitosa (200):
     * {
     *   "message": "Autenticación exitosa.",
     *   "user": { id, name, email },
     *   "token": "1|abc123..."
     * }
     *
     * Respuesta fallida (401):
     * {
     *   "message": "Credenciales incorrectas."
     * }
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Buscamos el usuario por email
        $user = User::where('email', $request->email)->first();

        // Verificamos que exista y que la contraseña sea correcta
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.',
            ], 401);
        }

        // Revocamos tokens anteriores para que solo exista uno activo
        // Esto evita que un psicólogo acumule tokens huérfanos
        $user->tokens()->delete();

        // Creamos el nuevo token con un nombre descriptivo
        $token = $user->createToken('auth_token_clinica')->plainTextToken;

        return response()->json([
            'message' => 'Autenticación exitosa.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'token'   => $token,
        ], 200);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token_clinica')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso.',
            'user'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'token'   => $token,
        ], 201);
    }

    /**
     * Devuelve los datos del usuario actualmente autenticado.
     *
     * React llamará a este endpoint al cargar la app para
     * verificar si el token guardado sigue siendo válido
     * y obtener los datos del psicólogo en sesión.
     *
     * @param  Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ],
        ], 200);
    }

    /**
     * Cierre de sesión del psicólogo.
     *
     * Revoca únicamente el token con el que se hizo la petición,
     * no todos los tokens del usuario (útil si en el futuro
     * se permiten múltiples dispositivos).
     *
     * @param  Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        // Revocamos solo el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ], 200);
    }
}