<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * PsicologoSeeder
 *
 * Crea un usuario psicólogo inicial para desarrollo y pruebas.
 * NO usar datos reales en seeders — solo datos ficticios.
 */
class PsicologoSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'psicologo@clinica.test'],
            [
                'name'     => 'Dr. Usuario Prueba',
                'email'    => 'psicologo@clinica.test',
                'password' => Hash::make('password123'),
            ]
        );

        $this->command->info('Psicólogo de prueba creado: psicologo@clinica.test / password123');
    }
}