<?php
// database/migrations/xxxx_create_notas_clinicas_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas_clinicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesion_id')
                  ->constrained('sesiones')
                  ->onDelete('cascade');

            // Formato SOAP (estándar clínico)
            $table->text('subjetivo')->nullable();         // Lo que reporta el paciente
            $table->text('objetivo')->nullable();          // Observaciones del psicólogo
            $table->text('analisis')->nullable();           // Interpretación clínica
            $table->text('plan')->nullable();               // Plan de tratamiento

            $table->text('contenido');                     // Nota libre completa
            $table->text('tecnicas_utilizadas')->nullable(); // Técnicas aplicadas
            $table->text('tareas_asignadas')->nullable();  // Tareas para el paciente
            $table->text('observaciones')->nullable();

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

            $table->index('sesion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_clinicas');
    }
};