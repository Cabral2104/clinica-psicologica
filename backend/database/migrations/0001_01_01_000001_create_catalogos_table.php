<?php
// database/migrations/0001_01_01_000001_create_catalogos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalogos', function (Blueprint $table) {
            $table->id();
            $table->string('grupo', 50);          // Ej: 'genero', 'tipo_sesion', 'estado_paciente'
            $table->string('clave', 50);           // Ej: 'M', 'individual', 'activo'
            $table->string('valor', 150);          // Ej: 'Masculino', 'Individual', 'Activo'
            $table->integer('orden')->default(0);  // Para ordenar en dropdowns
            $table->boolean('status')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['grupo', 'clave']);     // No duplicar claves por grupo
            $table->index('grupo');
        });

        // Seed inicial de catálogos
        $now = now();
        DB::table('catalogos')->insert([
            // Géneros
            ['grupo' => 'genero', 'clave' => 'M', 'valor' => 'Masculino', 'orden' => 1, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'genero', 'clave' => 'F', 'valor' => 'Femenino', 'orden' => 2, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'genero', 'clave' => 'NB', 'valor' => 'No binario', 'orden' => 3, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'genero', 'clave' => 'O', 'valor' => 'Otro', 'orden' => 4, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],

            // Estado del paciente
            ['grupo' => 'estado_paciente', 'clave' => 'activo', 'valor' => 'Activo', 'orden' => 1, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_paciente', 'clave' => 'alta', 'valor' => 'Alta terapéutica', 'orden' => 2, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_paciente', 'clave' => 'baja', 'valor' => 'Baja / Inactivo', 'orden' => 3, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],

            // Tipo de sesión
            ['grupo' => 'tipo_sesion', 'clave' => 'individual', 'valor' => 'Individual', 'orden' => 1, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'tipo_sesion', 'clave' => 'pareja', 'valor' => 'De pareja', 'orden' => 2, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'tipo_sesion', 'clave' => 'familiar', 'valor' => 'Familiar', 'orden' => 3, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'tipo_sesion', 'clave' => 'grupal', 'valor' => 'Grupal', 'orden' => 4, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],

            // Estado de sesión
            ['grupo' => 'estado_sesion', 'clave' => 'programada', 'valor' => 'Programada', 'orden' => 1, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_sesion', 'clave' => 'completada', 'valor' => 'Completada', 'orden' => 2, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_sesion', 'clave' => 'cancelada', 'valor' => 'Cancelada', 'orden' => 3, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_sesion', 'clave' => 'no_asistio', 'valor' => 'No asistió', 'orden' => 4, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],

            // Estado civil
            ['grupo' => 'estado_civil', 'clave' => 'soltero', 'valor' => 'Soltero(a)', 'orden' => 1, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_civil', 'clave' => 'casado', 'valor' => 'Casado(a)', 'orden' => 2, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_civil', 'clave' => 'union_libre', 'valor' => 'Unión libre', 'orden' => 3, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_civil', 'clave' => 'divorciado', 'valor' => 'Divorciado(a)', 'orden' => 4, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'estado_civil', 'clave' => 'viudo', 'valor' => 'Viudo(a)', 'orden' => 5, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],

            // Escolaridad
            ['grupo' => 'escolaridad', 'clave' => 'primaria', 'valor' => 'Primaria', 'orden' => 1, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'escolaridad', 'clave' => 'secundaria', 'valor' => 'Secundaria', 'orden' => 2, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'escolaridad', 'clave' => 'preparatoria', 'valor' => 'Preparatoria', 'orden' => 3, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'escolaridad', 'clave' => 'licenciatura', 'valor' => 'Licenciatura', 'orden' => 4, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['grupo' => 'escolaridad', 'clave' => 'posgrado', 'valor' => 'Posgrado', 'orden' => 5, 'status' => true, 'created_by' => null, 'updated_by' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('catalogos');
    }
};