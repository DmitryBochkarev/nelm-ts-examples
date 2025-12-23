import { RenderContext, RenderResult } from "../types/nelm";

export function render($: RenderContext): RenderResult {
  const configMap = {
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: "ts-root-config",
    },
    data: {
      source: "ts-root-chart (TypeScript)",
      rootMessage: $.Values.rootMessage || "no message",
      chartName: $.Chart.Name,
      releaseName: $.Release.Name,
    },
  };
  return { manifests: [configMap] };
}
