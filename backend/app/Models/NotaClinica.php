<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class NotaClinica extends Model
{
    use HasFactory, Auditable;

    protected $table = 'notas_clinicas';

    protected $fillable = [
        'sesion_id', 'subjetivo', 'objetivo', 'analisis', 'plan',
        'contenido', 'tecnicas_utilizadas', 'tareas_asignadas',
        'observaciones', 'status',
    ];

    protected function casts(): array
    {
        return ['status' => 'boolean'];
    }

    public function sesion()
    {
        return $this->belongsTo(Sesion::class);
    }

    public function analisisSentimiento()
    {
        return $this->hasOne(AnalisisSentimiento::class);
    }
}