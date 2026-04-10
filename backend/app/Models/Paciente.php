<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Paciente extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'user_id', 'nombre', 'apellido_paterno', 'apellido_materno',
        'fecha_nacimiento', 'lugar_nacimiento', 'curp',
        'genero_id', 'estado_civil_id', 'escolaridad_id',
        'telefono', 'celular', 'email',
        'calle', 'colonia', 'ciudad', 'estado_geo', 'codigo_postal',
        'ocupacion', 'lugar_trabajo',
        'motivo_consulta', 'antecedentes_personales',
        'antecedentes_familiares', 'medicacion_actual',
        'estado_paciente_id', 'status',
    ];

    protected function casts(): array
    {
        return [
            'fecha_nacimiento' => 'date',
            'status'           => 'boolean',
        ];
    }

    // Nombre completo (accessor)
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombre} {$this->apellido_paterno} {$this->apellido_materno}");
    }

    // Relaciones
    public function psicologo()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function genero()
    {
        return $this->belongsTo(Catalogo::class, 'genero_id');
    }

    public function estadoCivil()
    {
        return $this->belongsTo(Catalogo::class, 'estado_civil_id');
    }

    public function escolaridad()
    {
        return $this->belongsTo(Catalogo::class, 'escolaridad_id');
    }

    public function estadoPaciente()
    {
        return $this->belongsTo(Catalogo::class, 'estado_paciente_id');
    }

    public function contactosEmergencia()
    {
        return $this->hasMany(ContactoEmergencia::class);
    }

    public function diagnosticos()
    {
        return $this->hasMany(Diagnostico::class);
    }

    public function sesiones()
    {
        return $this->hasMany(Sesion::class);
    }

    // Diagnóstico principal activo
    public function diagnosticoPrincipal()
    {
        return $this->hasOne(Diagnostico::class)
                    ->where('es_principal', true)
                    ->where('status', true);
    }
}