<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalogo_cie10', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 10)->unique(); // Ej: F41.1
            $table->string('descripcion', 255);     // Ej: Trastorno de ansiedad generalizada
            $table->boolean('activo')->default(true);
            $table->timestamps();
            
            // Índice de búsqueda para que las consultas con miles de registros sean instantáneas
            $table->index(['codigo', 'descripcion']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalogo_cie10');
    }
};