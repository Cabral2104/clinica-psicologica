<?php
// database/migrations/xxxx_create_diagnosticos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnosticos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')
                  ->constrained('pacientes')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('restrict');           // Psicólogo que diagnosticó
            $table->string('codigo_cie', 20)->nullable();  // CIE-10/11
            $table->string('codigo_dsm', 20)->nullable();  // DSM-5
            $table->string('nombre_diagnostico', 300);
            $table->text('descripcion')->nullable();
            $table->date('fecha_diagnostico');
            $table->boolean('es_principal')->default(false); // Diagnóstico principal

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

            $table->index('paciente_id');
            $table->index('codigo_cie');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnosticos');
    }
};