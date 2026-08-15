import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_NAMESPACE } from "@opentelemetry/semantic-conventions";

let started = false;
let sdk: NodeSDK | null = null;

export async function startInstrumentation() {
  if (started) return;

  const metricReader = new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
    }),
  });

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    }),
    metricReader,
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? "rdm-smart-city-os",
      [ATTR_SERVICE_NAMESPACE]: "real-del-monte",
    }),
  });

  await sdk.start();
  started = true;
}

export async function shutdownInstrumentation() {
  if (!sdk) return;
  await sdk.shutdown();
  started = false;
  sdk = null;
}
