<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Clínico General</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 12px; color: #333; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0; color: #0f766e; font-size: 22px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; color: #64748b; font-size: 11px; }
        
        .section-title { background-color: #f1f5f9; color: #0f766e; padding: 6px 10px; font-weight: bold; font-size: 14px; margin-top: 25px; margin-bottom: 15px; border-left: 3px solid #0f766e; }
        
        /* Contenedores de Tarjetas (KPIs) */
        .kpi-container { width: 100%; margin-bottom: 20px; }
        .kpi-box { display: inline-block; width: 30%; border: 1px solid #e2e8f0; padding: 15px; text-align: center; border-radius: 5px; margin-right: 2%; }
        .kpi-title { font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
        .kpi-value { font-size: 24px; font-weight: bold; color: #0f766e; margin: 0; }
        
        /* Tablas */
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f8fafc; color: #475569; font-weight: bold; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Reporte Estadístico Clínico</h1>
        <p>NexusSalud - Plataforma Clínica | Generado el: {{ date('d/m/Y H:i') }}</p>
    </div>

    <!-- KPIs -->
    <div class="kpi-container">
        <div class="kpi-box">
            <div class="kpi-title">Pacientes Activos</div>
            <div class="kpi-value">{{ $stats['kpis']['total_pacientes'] }}</div>
        </div>
        <div class="kpi-box">
            <div class="kpi-title">Total de Sesiones</div>
            <div class="kpi-value">{{ $stats['kpis']['total_sesiones'] }}</div>
        </div>
        <div class="kpi-box" style="margin-right: 0;">
            <div class="kpi-title">Sesiones este mes</div>
            <div class="kpi-value">{{ $stats['kpis']['sesiones_mes'] }}</div>
        </div>
    </div>

    <!-- Demografía e IA en paralelo usando tablas sin bordes -->
    <table style="margin-bottom: 0;">
        <tr>
            <td style="width: 50%; vertical-align: top; padding: 0 10px 0 0; border: none;">
                <div class="section-title" style="margin-top: 0;">Demografía por Género</div>
                <table>
                    <tr><th>Género</th><th class="text-right">Total</th></tr>
                    @foreach($stats['genero_stats'] as $genero)
                        <tr><td>{{ $genero['name'] }}</td><td class="text-right">{{ $genero['total'] }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td style="width: 50%; vertical-align: top; padding: 0 0 0 10px; border: none;">
                <div class="section-title" style="margin-top: 0;">Termómetro NLP (IA)</div>
                <table>
                    <tr><th>Sentimiento Evaluado</th><th class="text-right">Notas Clínicas</th></tr>
                    <tr><td>Positivo</td><td class="text-right">{{ $stats['nlp_stats']['Positivo'] }}</td></tr>
                    <tr><td>Neutral</td><td class="text-right">{{ $stats['nlp_stats']['Neutral'] }}</td></tr>
                    <tr><td>Riesgo</td><td class="text-right">{{ $stats['nlp_stats']['Riesgo'] }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Morbilidad -->
    <div class="section-title">Morbilidad Frecuente (Top Diagnósticos)</div>
    @if(count($stats['top_diagnosticos']) > 0)
        <table>
            <tr>
                <th>Código CIE-10</th>
                <th>Diagnóstico</th>
                <th class="text-center">Casos Detectados</th>
            </tr>
            @foreach($stats['top_diagnosticos'] as $diag)
                <tr>
                    <td style="font-weight: bold;">{{ $diag->codigo_cie }}</td>
                    <td>{{ $diag->nombre_diagnostico }}</td>
                    <td class="text-center">{{ $diag->total }}</td>
                </tr>
            @endforeach
        </table>
    @else
        <p style="color: #64748b; font-style: italic;">No hay diagnósticos suficientes registrados.</p>
    @endif

    <!-- Últimos Ingresos -->
    <div class="section-title">Últimos Pacientes Ingresados</div>
    @if(count($stats['pacientes_recientes']) > 0)
        <table>
            <tr>
                <th>Expediente</th>
                <th>Nombre del Paciente</th>
                <th>Fecha de Registro</th>
            </tr>
            @foreach($stats['pacientes_recientes'] as $paciente)
                <tr>
                    <td>#{{ str_pad($paciente->id, 4, '0', STR_PAD_LEFT) }}</td>
                    <td style="font-weight: bold;">{{ $paciente->nombre }} {{ $paciente->apellido_paterno }}</td>
                    <td>{{ date('d/m/Y', strtotime($paciente->created_at)) }}</td>
                </tr>
            @endforeach
        </table>
    @else
        <p style="color: #64748b; font-style: italic;">No hay ingresos recientes.</p>
    @endif

</body>
</html>