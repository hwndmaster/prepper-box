import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor, WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME, ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const DefaultTraceExportPath = "/otlp/v1/traces";
const DefaultServiceName = "prepper-box-web";
let isOpenTelemetryInitialized = false;

function getNonEmptyValue(value: string | undefined): string | undefined {
    if (value == null) {
        return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function getTraceExporterUrl(): string {
    const configuredEndpoint = getNonEmptyValue(import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT);
    if (configuredEndpoint != null) {
        return configuredEndpoint;
    }

    return `${window.location.origin}${DefaultTraceExportPath}`;
}

/**
 * Initializes browser-side OpenTelemetry instrumentation once per page load.
 */
export function setupOpenTelemetry(): void {
    if (isOpenTelemetryInitialized) {
        return;
    }

    isOpenTelemetryInitialized = true;

    const serviceName = getNonEmptyValue(import.meta.env.VITE_OTEL_SERVICE_NAME) ?? DefaultServiceName;

    const exporter = new OTLPTraceExporter({
        url: getTraceExporterUrl()
    });

    const tracerProvider = new WebTracerProvider({
        resource: resourceFromAttributes({
            [ATTR_SERVICE_NAME]: serviceName,
            [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: import.meta.env.MODE
        }),
        spanProcessors: [
            new BatchSpanProcessor(exporter, {
                scheduledDelayMillis: 1000,
                maxExportBatchSize: 20,
                maxQueueSize: 100
            })
        ]
    });

    tracerProvider.register();

    window.addEventListener("pagehide", () => {
        void tracerProvider.forceFlush();
    });

    registerInstrumentations({
        instrumentations: [
            new DocumentLoadInstrumentation(),
            new FetchInstrumentation({
                ignoreUrls: [/\/otlp\/v1\/traces$/]
            }),
            new XMLHttpRequestInstrumentation({
                ignoreUrls: [/\/otlp\/v1\/traces$/]
            })
        ]
    });
}
