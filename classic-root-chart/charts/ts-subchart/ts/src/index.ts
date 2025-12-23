import { RenderContext, RenderResult } from "../types/nelm";

export function render($: RenderContext): RenderResult {
  const configMap = {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: "ts-subchart-config",
    },
    data: {
      source: "ts-subchart (TypeScript)",
      subchartMessage: $.Values.subchartMessage || "no message",
      chartName: $.Chart.Name,
      releaseName: $.Release.Name,
    },
  };
  return { manifests: [configMap] };
}
