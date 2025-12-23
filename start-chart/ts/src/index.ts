import { RenderContext, RenderResult } from '../types/nelm';
import { newDeployment, newService } from './resources';

export function render($: RenderContext): RenderResult {
  const manifests: object[] = [];

  manifests.push(newDeployment($));

  if ($.Values.service?.enabled !== false) {
    manifests.push(newService($));
  }

  return { manifests };
}
