import { RenderContext, RenderResult } from '../types/nelm';
import {
  createDeployment,
  createService,
  createServiceAccount,
  createIngress,
  createHPA,
} from './resources';
import {
  shouldCreateIngress,
  shouldCreateHPA,
  shouldCreateServiceAccount,
} from './helpers';

export function render(context: RenderContext): RenderResult {
  const manifests: object[] = [];

  // ServiceAccount
  if (shouldCreateServiceAccount(context)) {
    manifests.push(createServiceAccount(context));
  }

  // Deployment
  manifests.push(createDeployment(context));

  // Service
  manifests.push(createService(context));

  // Ingress
  if (shouldCreateIngress(context)) {
    manifests.push(createIngress(context));
  }

  // HorizontalPodAutoscaler
  if (shouldCreateHPA(context)) {
    manifests.push(createHPA(context));
  }

  return { manifests };
}
