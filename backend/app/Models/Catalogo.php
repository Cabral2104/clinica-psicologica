<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Catalogo extends Model
{
    use Auditable;

    protected $fillable = [
        'grupo', 'clave', 'valor', 'orden', 'status',
    ];

    protected function casts(): array
    {
        return ['status' => 'boolean'];
    }

    /**
     * Scope para filtrar por grupo de catálogo.
     * Uso: Catalogo::grupo('genero')->get()
     */
    public function scopeGrupo($query, string $grupo)
    {
        return $query->where('grupo', $grupo)
                     ->where('status', true)
                     ->orderBy('orden');
    }
}