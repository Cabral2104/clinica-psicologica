<?php
// database/migrations/xxxx_create_pacientes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();

            // Psicólogo responsable
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('restrict');

            // Datos personales
            $table->string('nombre', 100);
            $table->string('apellido_paterno', 100);
            $table->string('apellido_materno', 100)->nullable();
            $table->date('fecha_nacimiento');
            $table->string('lugar_nacimiento', 150)->nullable();
            $table->string('curp', 18)->nullable()->unique();

            // Catálogos normalizados (FK a catalogos)
            $table->foreignId('genero_id')
                  ->constrained('catalogos')
                  ->onDelete('restrict');
            $table->foreignId('estado_civil_id')
                  ->nullable()
                  ->constrained('catalogos')
                  ->onDelete('restrict');
            $table->foreignId('escolaridad_id')
                  ->nullable()
                  ->constrained('catalogos')
                  ->onDelete('restrict');

            // Contacto
            $table->string('telefono', 20)->nullable();
            $table->string('celular', 20)->nullable();
            $table->string('email', 150)->nullable();

            // Dirección
            $table->string('calle', 200)->nullable();
            $table->string('colonia', 150)->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->string('estado_geo', 100)->nullable();  // "estado" geográfico
            $table->string('codigo_postal', 10)->nullable();

            // Datos laborales
            $table->string('ocupacion', 150)->nullable();
            $table->string('lugar_trabajo', 200)->nullable();

            // Clínicos
            $table->text('motivo_consulta');
            $table->text('antecedentes_personales')->nullable();
            $table->text('antecedentes_familiares')->nullable();
            $table->text('medicacion_actual')->nullable();
            $table->foreignId('estado_paciente_id')
                  ->constrained('catalogos')
                  ->onDelete('restrict');

            // Auditoría
            $table->boolean('status')->default(true);
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->foreignId('updated_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->timestamps();

            // Índices
            $table->index(['apellido_paterno', 'apellido_materno', 'nombre']);
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};