<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class ContactoEmergencia extends Model
{
    use Auditable;

    protected $table = 'contactos_emergencia';

    protected $fillable = [
        'paciente_id', 'nombre_completo', 'parentesco',
        'telefono', 'celular', 'email', 'status',
    ];

    protected function casts(): array
    {
        return ['status' => 'boolean'];
    }

    public function paciente()
    {
        return $this->belongsTo(Paciente::class);
    }
}