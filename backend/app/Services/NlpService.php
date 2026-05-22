<?php

namespace App\Services;

use App\Models\AnalisisSentimiento;
use App\Models\NotaClinica;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * NlpService
 *
 * Responsabilidad única: comunicarse con el microservicio Python
 * de análisis de sentimientos y persistir el resultado.
 *
 * Diseño defensivo: si el servicio NLP no está disponible o falla,
 * el error se registra en el log pero NO interrumpe el flujo principal.
 * La nota clínica se guarda correctamente aunque el NLP falle.
 * Esto es crítico: el sistema clínico nunca debe fallar por el NLP.
 */
class NlpService
{
    private string $baseUrl;

    public function __construct()
    {
        // Leemos la URL desde config/services.php
        $this->baseUrl = config('services.nlp.url');
    }

    /**
     * Analiza el texto de una nota clínica y persiste el resultado.
     *
     * @param  NotaClinica $nota  El modelo de nota ya guardado en BD
     * @return bool               True si el análisis fue exitoso, false si falló
     */
    public function analizar(NotaClinica $nota): bool
    {
        // Construimos el texto a analizar combinando los campos SOAP
        // y el contenido libre. Damos prioridad a subjetivo + contenido
        // porque representan mejor el estado del paciente.
        $texto = $this->construirTextoAnalisis($nota);

        try {
            // Llamada HTTP al microservicio Python con timeout de 30 segundos
            $respuesta = Http::timeout(30)
                ->post("{$this->baseUrl}/analizar", [
                    'texto' => $texto,
                ]);

            // Si la respuesta no fue exitosa, registramos y salimos
            if (! $respuesta->successful()) {
                Log::warning('NlpService: respuesta no exitosa del microservicio.', [
                    'nota_id' => $nota->id,
                    'status'  => $respuesta->status(),
                ]);
                return false;
            }

            $datos = $respuesta->json();

            // Validamos que la respuesta tenga la estructura esperada
            if (! isset($datos['label'], $datos['score'], $datos['estrellas'])) {
                Log::warning('NlpService: respuesta inesperada del microservicio.', [
                    'nota_id'  => $nota->id,
                    'respuesta' => $datos,
                ]);
                return false;
            }

            // Guardamos o actualizamos el análisis en la BD
            // Si la nota ya tenía análisis (por edición), lo sobreescribimos
            AnalisisSentimiento::updateOrCreate(
                ['nota_clinica_id' => $nota->id],
                [
                    'label'            => $datos['label'],
                    'score'            => $datos['score'],
                    'estrellas'        => $datos['estrellas'],
                    'texto_analizado'  => substr($texto, 0, 500), // Guardamos solo los primeros 500 chars
                    'modelo_utilizado' => 'nlptown/bert-base-multilingual-uncased-sentiment',
                    'status'           => true,
                ]
            );

            Log::info('NlpService: análisis completado.', [
                'nota_id'   => $nota->id,
                'estrellas' => $datos['estrellas'],
                'score'     => $datos['score'],
            ]);

            return true;

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // El microservicio no está corriendo o no responde
            Log::error('NlpService: el microservicio no está disponible.', [
                'nota_id' => $nota->id,
                'error'   => $e->getMessage(),
            ]);
            return false;

        } catch (\Exception $e) {
            // Cualquier otro error inesperado
            Log::error('NlpService: error inesperado.', [
                'nota_id' => $nota->id,
                'error'   => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Construye el texto que se enviará al modelo NLP.
     *
     * Combina los campos más relevantes de la nota para dar
     * al modelo el mayor contexto posible. El modelo tiene un
     * límite de 512 tokens, por eso recortamos el texto final
     * en el endpoint de Python.
     *
     * Orden de prioridad:
     *   1. Subjetivo (voz del paciente — más relevante para el análisis)
     *   2. Análisis clínico
     *   3. Contenido libre
     *   4. Plan (menos relevante para estado emocional)
     *
     * @param  NotaClinica $nota
     * @return string
     */
    private function construirTextoAnalisis(NotaClinica $nota): string
    {
        $partes = array_filter([
            $nota->subjetivo,
            $nota->analisis,
            $nota->contenido,
            $nota->objetivo,
            $nota->plan,
        ]);

        return implode(' ', $partes);
    }
}