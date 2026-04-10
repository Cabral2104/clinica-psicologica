<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Diagnostico extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'paciente_id', 'user_id', 'codigo_cie', 'codigo_dsm',
        'nombre_diagnostico', 'descripcion', 'fecha_diagnostico',
        'es_principal', 'status',
    ];

    protected function casts(): array
    {
        return [
            'fecha_diagnostico' => 'date',
            'es_principal'      => 'boolean',
            'status'            => 'boolean',
        ];
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }

    public function psicologo()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}