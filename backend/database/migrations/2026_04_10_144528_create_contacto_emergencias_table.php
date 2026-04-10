<?php
// database/migrations/xxxx_create_contactos_emergencia_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contactos_emergencia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')
                  ->constrained('pacientes')
                  ->onDelete('cascade');
            $table->string('nombre_completo', 200);
            $table->string('parentesco', 100);
            $table->string('telefono', 20);
            $table->string('celular', 20)->nullable();
            $table->string('email', 150)->nullable();

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
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos_emergencia');
    }
};