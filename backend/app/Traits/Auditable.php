<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait Auditable
{
    /**
     * Se ejecuta automáticamente en cada creating/updating
     * para llenar created_by y updated_by con el usuario autenticado.
     */
    public static function bootAuditable(): void
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
                $model->updated_by = Auth::id();
            }
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }
        });
    }

    // Relaciones de auditoría
    public function creador()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    /**
     * Scope: por defecto solo trae registros activos (status = 1).
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeWithInactive($query)
    {
        return $query;
    }

    /**
     * Soft delete lógico: cambia status a 0 en vez de eliminar.
     */
    public function deactivate(): bool
    {
        $this->status = false;
        $this->updated_by = Auth::id();
        return $this->save();
    }

    public function reactivate(): bool
    {
        $this->status = true;
        $this->updated_by = Auth::id();
        return $this->save();
    }
}