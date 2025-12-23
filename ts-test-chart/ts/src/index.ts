import { RenderContext, RenderResult } from '../types/nelm';

export function render($: RenderContext): RenderResult {
  const debugInfo = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name: 'render-context-debug',
    },
    data: {
      'values': JSON.stringify($.Values, null, 2),
      'release': JSON.stringify($.Release, null, 2),
      'chart': JSON.stringify($.Chart, null, 2),
      'capabilities': JSON.stringify($.Capabilities, null, 2),
      'runtime': JSON.stringify(($ as any).Runtime, null, 2),
      'files-keys': JSON.stringify(Object.keys($.Files || {}), null, 2),
    },
  };
  return { manifests: [debugInfo] };
}
