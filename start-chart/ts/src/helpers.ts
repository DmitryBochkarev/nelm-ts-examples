import { RenderContext } from '../types/nelm';

/**
 * Truncate string to max length, removing trailing hyphens.
 */
export function trunc(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).replace(/-+$/, '');
}

/**
 * Get the chart name, respecting nameOverride.
 */
export function name(context: RenderContext): string {
  const override = context.Values.nameOverride;
  return trunc(override || context.Chart.Name, 63);
}

/**
 * Get the fully qualified app name.
 * Truncated at 63 chars (DNS naming spec limit).
 */
export function fullname(context: RenderContext): string {
  const { Release, Chart, Values } = context;

  if (Values.fullnameOverride) {
    return trunc(Values.fullnameOverride, 63);
  }

  const chartName = Values.nameOverride || Chart.Name;

  if (Release.Name.includes(chartName)) {
    return trunc(Release.Name, 63);
  }

  return trunc(`${Release.Name}-${chartName}`, 63);
}

/**
 * Get chart name and version for chart label.
 */
export function chart(context: RenderContext): string {
  const str = `${context.Chart.Name}-${context.Chart.Version}`.replace(/\\+/g, '_');
  return trunc(str, 63);
}

/**
 * Common labels for all resources.
 */
export function labels(context: RenderContext): Record<string, string> {
  return {
    'helm.sh/chart': chart(context),
    ...selectorLabels(context),
    ...(context.Chart.AppVersion
      ? { 'app.kubernetes.io/version': context.Chart.AppVersion }
      : {}),
    'app.kubernetes.io/managed-by': context.Release.Service,
  };
}

/**
 * Selector labels for matching pods.
 */
export function selectorLabels(context: RenderContext): Record<string, string> {
  return {
    'app.kubernetes.io/name': name(context),
    'app.kubernetes.io/instance': context.Release.Name,
  };
}

/**
 * Get the service account name.
 */
export function serviceAccountName(context: RenderContext): string {
  const sa = context.Values.serviceAccount;
  if (sa?.create) {
    return sa.name || fullname(context);
  }
  return sa?.name || 'default';
}

/**
 * Check if ServiceAccount should be created.
 */
export function shouldCreateServiceAccount(context: RenderContext): boolean {
  return context.Values.serviceAccount?.create === true;
}

/**
 * Check if Ingress should be created.
 */
export function shouldCreateIngress(context: RenderContext): boolean {
  return context.Values.ingress?.enabled === true;
}

/**
 * Check if HPA should be created.
 */
export function shouldCreateHPA(context: RenderContext): boolean {
  return context.Values.autoscaling?.enabled === true;
}
