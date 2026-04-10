<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class AnalisisSentimiento extends Model
{
    use HasFactory, Auditable;

    protected $table = 'analisis_sentimientos';

    protected $fillable = [
        'nota_clinica_id', 'label', 'score', 'estrellas',
        'texto_analizado', 'modelo_utilizado', 'status',
    ];

    protected function casts(): array
    {
        return [
            'score'  => 'decimal:4',
            'status' => 'boolean',
        ];
    }

    public function nota()
    {
        return $this->belongsTo(NotaClinica::class, 'nota_clinica_id');
    }
}