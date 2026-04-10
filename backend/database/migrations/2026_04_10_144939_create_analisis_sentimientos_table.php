<?php
// database/migrations/xxxx_create_analisis_sentimientos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analisis_sentimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nota_clinica_id')
                  ->constrained('notas_clinicas')
                  ->onDelete('cascade');

            $table->string('label', 50);               // Ej: "4 stars"
            $table->decimal('score', 5, 4);             // Ej: 0.8734
            $table->tinyInteger('estrellas');            // 1 a 5 (mapeo emocional)
            $table->text('texto_analizado')->nullable(); // Texto que se envió al NLP
            $table->string('modelo_utilizado', 100)      // Qué modelo de IA se usó
                  ->default('nlptown/bert-base-multilingual-uncased-sentiment');

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

            $table->index('nota_clinica_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analisis_sentimientos');
    }
};