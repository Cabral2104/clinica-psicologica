<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Expediente Clínico - {{ $paciente->nombre }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #0f766e; font-size: 20px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; color: #666; font-size: 11px; }
        
        .section-title { background-color: #f1f5f9; color: #0f766e; padding: 5px 10px; font-weight: bold; font-size: 14px; margin-top: 20px; border-left: 3px solid #0f766e; }
        
        .info-table { border-collapse: collapse; margin-top: 10px; width: 100%; }
        .info-table th { text-align: left; padding: 6px; color: #64748b; font-size: 10px; text-transform: uppercase; width: 25%; border-bottom: 1px solid #f1f5f9; }
        .info-table td { padding: 6px; font-weight: bold; width: 25%; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        
        .diagnostico-box { border: 1px solid #e2e8f0; padding: 10px; margin-top: 10px; border-radius: 4px; }
        .diagnostico-box h4 { margin: 0 0 5px; color: #0f766e; }
        
        .sesion-box { border-bottom: 1px dashed #cbd5e1; padding-bottom: 15px; margin-top: 15px; page-break-inside: avoid; }
        .sesion-header { font-weight: bold; color: #334155; margin-bottom: 5px; background-color: #f8fafc; padding: 5px; border-radius: 4px;}
        .nota-title { font-size: 10px; color: #0f766e; text-transform: uppercase; margin-top: 8px; margin-bottom: 2px; font-weight: bold;}
        .nota-content { margin-top: 0; margin-bottom: 10px; text-align: justify; color: #475569; }
        
        .page-break { page-break-after: always; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Expediente Clínico</h1>
        <p>NexusSalud - Plataforma Clínica | Fecha de impresión: {{ date('d/m/Y H:i') }}</p>
    </div>

    <!-- DATOS DEMOGRÁFICOS -->
    <div class="section-title">DATOS GENERALES</div>
    <table class="info-table">
        <tr>
            <th>Nombre Completo</th>
            <td colspan="3">{{ $paciente->nombre }} {{ $paciente->apellido_paterno }} {{ $paciente->apellido_materno }}</td>
        </tr>
        <tr>
            <th>No. Expediente</th>
            <td>{{ str_pad($paciente->id, 4, '0', STR_PAD_LEFT) }}</td>
            <th>Fecha de Ingreso</th>
            <td>{{ $paciente->created_at->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <th>Fecha de Nac. / Edad</th>
            <td>
                @if($paciente->fecha_nacimiento)
                    {{ date('d/m/Y', strtotime($paciente->fecha_nacimiento)) }} 
                    ({{ \Carbon\Carbon::parse($paciente->fecha_nacimiento)->age }} años)
                @else
                    No registrada
                @endif
            </td>
            <th>Género</th>
            <td>{{ $paciente->genero->nombre ?? $paciente->genero->valor ?? 'No especificado' }}</td>
        </tr>
        <tr>
            <th>Teléfono</th>
            <td>{{ $paciente->telefono ?? 'No registrado' }}</td>
            <th>Correo Electrónico</th>
            <td>{{ $paciente->email ?? 'No registrado' }}</td>
        </tr>
    </table>

    <!-- CONTACTOS DE EMERGENCIA -->
    <div class="section-title">CONTACTOS DE EMERGENCIA</div>
    @if($paciente->contactosEmergencia && count($paciente->contactosEmergencia) > 0)
        <table class="info-table">
            @foreach($paciente->contactosEmergencia as $contacto)
            <tr>
                <th>Nombre del Contacto</th>
                <td>{{ $contacto->nombre_completo }}</td>
                <th>Parentesco / Relación</th>
                <td>{{ $contacto->parentesco }}</td>
            </tr>
            <tr>
                <th>Teléfono de Emergencia</th>
                <td colspan="3">{{ $contacto->telefono }}</td>
            </tr>
            @endforeach
        </table>
    @else
        <p style="color: #64748b; font-style: italic; font-size: 11px; margin-top: 10px;">Sin contactos de emergencia registrados en el sistema.</p>
    @endif

    <!-- DIAGNÓSTICOS -->
    <div class="section-title">IMPRESIONES DIAGNÓSTICAS</div>
    @if(count($paciente->diagnosticos) > 0)
        @foreach($paciente->diagnosticos as $diag)
            <div class="diagnostico-box">
                <h4>{{ $diag->codigo_cie }} - {{ $diag->nombre_diagnostico }}</h4>
                <p style="margin:0; font-size: 11px;"><strong>Fecha:</strong> {{ date('d/m/Y', strtotime($diag->fecha_diagnostico)) }} | <strong>Estado:</strong> {{ $diag->status ? 'Activo' : 'Resuelto' }}</p>
                <p style="margin: 5px 0 0 0; color: #475569;">{{ $diag->descripcion }}</p>
            </div>
        @endforeach
    @else
        <p style="color: #64748b; font-style: italic; margin-top: 10px;">No hay diagnósticos registrados.</p>
    @endif

    <!-- SALTO DE PÁGINA -->
    <div class="page-break"></div>

    <div class="header">
        <h1>Historial Clínico (Notas SOAP)</h1>
        <p>Paciente: {{ $paciente->nombre }} {{ $paciente->apellido_paterno }} | Exp: {{ str_pad($paciente->id, 4, '0', STR_PAD_LEFT) }}</p>
    </div>

    <!-- NOTAS CLÍNICAS Y ANÁLISIS NLP -->
    @if(count($paciente->sesiones) > 0)
        @foreach($paciente->sesiones as $sesion)
            <div class="sesion-box">
                <div class="sesion-header">
                    Sesión #{{ $sesion->numero_sesion }} - Realizada el: {{ date('d/m/Y', strtotime($sesion->fecha_sesion)) }}
                </div>
                
                @if($sesion->nota)
                    
                    @if($sesion->nota->contenido)
                        <div class="nota-title">Resumen de la Sesión (Evaluado por IA)</div>
                        <p class="nota-content">{{ $sesion->nota->contenido }}</p>
                    @endif

                    @if($sesion->nota->subjetivo)
                        <div class="nota-title">(S) Subjetivo</div>
                        <p class="nota-content">{{ $sesion->nota->subjetivo }}</p>
                    @endif

                    @if($sesion->nota->objetivo)
                        <div class="nota-title">(O) Objetivo</div>
                        <p class="nota-content">{{ $sesion->nota->objetivo }}</p>
                    @endif

                    @if($sesion->nota->analisis)
                        <div class="nota-title">(A) Análisis</div>
                        <p class="nota-content">{{ $sesion->nota->analisis }}</p>
                    @endif

                    @if($sesion->nota->plan)
                        <div class="nota-title">(P) Plan</div>
                        <p class="nota-content">{{ $sesion->nota->plan }}</p>
                    @endif
                    
                    <!-- NUEVOS CAMPOS AGREGADOS -->
                    @if($sesion->nota->tecnicas_utilizadas)
                        <div class="nota-title">Técnicas Utilizadas</div>
                        <p class="nota-content">{{ $sesion->nota->tecnicas_utilizadas }}</p>
                    @endif

                    @if($sesion->nota->tareas_asignadas)
                        <div class="nota-title">Tareas Asignadas</div>
                        <p class="nota-content">{{ $sesion->nota->tareas_asignadas }}</p>
                    @endif

                @else
                    <p style="color: #94a3b8; font-style: italic; font-size: 11px; margin-top: 10px;">Sin nota clínica redactada para esta sesión.</p>
                @endif
            </div>
        @endforeach
    @else
        <p style="color: #64748b; font-style: italic; text-align: center; margin-top: 50px;">El historial de sesiones está vacío.</p>
    @endif

</body>
</html>