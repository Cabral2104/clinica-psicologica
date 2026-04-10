<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Sesion extends Model
{
    use HasFactory, Auditable;

    protected $table = 'sesiones';

    protected $fillable = [
        'paciente_id', 'user_id', 'numero_sesion',
        'fecha_sesion', 'hora_inicio', 'hora_fin',
        'duracion_minutos', 'tipo_sesion_id', 'estado_sesion_id',
        'observaciones_generales', 'costo', 'pagada', 'status',
    ];

    protected function casts(): array
    {
        return [
            'fecha_sesion' => 'datetime',
            'costo'        => 'decimal:2',
            'pagada'       => 'boolean',
            'status'       => 'boolean',
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

    public function tipoSesion()
    {
        return $this->belongsTo(Catalogo::class, 'tipo_sesion_id');
    }

    public function estadoSesion()
    {
        return $this->belongsTo(Catalogo::class, 'estado_sesion_id');
    }

    public function nota()
    {
        return $this->hasOne(NotaClinica::class);
    }
}