<?php
// database/migrations/xxxx_create_sesiones_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')
                  ->constrained('pacientes')
                  ->onDelete('restrict');
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('restrict');              // Psicólogo que atendió

            $table->integer('numero_sesion');
            $table->dateTime('fecha_sesion');
            $table->time('hora_inicio')->nullable();
            $table->time('hora_fin')->nullable();
            $table->integer('duracion_minutos')->default(50);

            // Catálogos normalizados
            $table->foreignId('tipo_sesion_id')
                  ->constrained('catalogos')
                  ->onDelete('restrict');
            $table->foreignId('estado_sesion_id')
                  ->constrained('catalogos')
                  ->onDelete('restrict');

            $table->text('observaciones_generales')->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->boolean('pagada')->default(false);

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

            $table->index(['paciente_id', 'fecha_sesion']);
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones');
    }
};