import { RenderContext } from '../types/nelm';
import { fullname, labels, selectorLabels, serviceAccountName } from './helpers';

/**
 * Create a Deployment resource.
 */
export function createDeployment(context: RenderContext): object {
  const { Values, Chart } = context;
  const name = fullname(context);

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name,
      labels: labels(context),
    },
    spec: {
      ...(Values.autoscaling?.enabled
        ? {}
        : { replicas: Values.replicaCount ?? 1 }),
      selector: {
        matchLabels: selectorLabels(context),
      },
      template: {
        metadata: {
          labels: {
            ...selectorLabels(context),
            ...Values.podLabels,
          },
          ...(Values.podAnnotations
            ? { annotations: Values.podAnnotations }
            : {}),
        },
        spec: {
          ...(Values.imagePullSecrets?.length
            ? { imagePullSecrets: Values.imagePullSecrets }
            : {}),
          serviceAccountName: serviceAccountName(context),
          ...(Values.podSecurityContext
            ? { securityContext: Values.podSecurityContext }
            : {}),
          containers: [
            {
              name: Chart.Name,
              ...(Values.securityContext
                ? { securityContext: Values.securityContext }
                : {}),
              image: `${Values.image?.repository}:${Values.image?.tag || Chart.AppVersion}`,
              imagePullPolicy: Values.image?.pullPolicy ?? 'IfNotPresent',
              ports: [
                {
                  name: 'http',
                  containerPort: Values.service?.port ?? 80,
                  protocol: 'TCP',
                },
              ],
              ...(Values.livenessProbe
                ? { livenessProbe: Values.livenessProbe }
                : {}),
              ...(Values.readinessProbe
                ? { readinessProbe: Values.readinessProbe }
                : {}),
              ...(Values.resources ? { resources: Values.resources } : {}),
              ...(Values.volumeMounts?.length
                ? { volumeMounts: Values.volumeMounts }
                : {}),
            },
          ],
          ...(Values.volumes?.length ? { volumes: Values.volumes } : {}),
          ...(Values.nodeSelector ? { nodeSelector: Values.nodeSelector } : {}),
          ...(Values.affinity ? { affinity: Values.affinity } : {}),
          ...(Values.tolerations?.length
            ? { tolerations: Values.tolerations }
            : {}),
        },
      },
    },
  };
}

/**
 * Create a Service resource.
 */
export function createService(context: RenderContext): object {
  const { Values } = context;

  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: fullname(context),
      labels: labels(context),
    },
    spec: {
      type: Values.service?.type ?? 'ClusterIP',
      ports: [
        {
          port: Values.service?.port ?? 80,
          targetPort: 'http',
          protocol: 'TCP',
          name: 'http',
        },
      ],
      selector: selectorLabels(context),
    },
  };
}

/**
 * Create a ServiceAccount resource.
 */
export function createServiceAccount(context: RenderContext): object {
  const { Values } = context;

  return {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: serviceAccountName(context),
      labels: labels(context),
      ...(Values.serviceAccount?.annotations
        ? { annotations: Values.serviceAccount.annotations }
        : {}),
    },
    automountServiceAccountToken: Values.serviceAccount?.automount ?? true,
  };
}

/**
 * Create an Ingress resource.
 */
export function createIngress(context: RenderContext): object {
  const { Values } = context;
  const name = fullname(context);
  const ing = Values.ingress;

  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name,
      labels: labels(context),
      ...(ing?.annotations ? { annotations: ing.annotations } : {}),
    },
    spec: {
      ...(ing?.className ? { ingressClassName: ing.className } : {}),
      ...(ing?.tls?.length ? { tls: ing.tls } : {}),
      rules: (ing?.hosts || []).map((host: any) => ({
        host: host.host,
        http: {
          paths: (host.paths || []).map((path: any) => ({
            path: path.path,
            pathType: path.pathType ?? 'ImplementationSpecific',
            backend: {
              service: {
                name,
                port: { number: Values.service?.port ?? 80 },
              },
            },
          })),
        },
      })),
    },
  };
}

/**
 * Create a HorizontalPodAutoscaler resource.
 */
export function createHPA(context: RenderContext): object {
  const { Values } = context;
  const as = Values.autoscaling;
  const name = fullname(context);

  const metrics: object[] = [];

  if (as?.targetCPUUtilizationPercentage) {
    metrics.push({
      type: 'Resource',
      resource: {
        name: 'cpu',
        target: {
          type: 'Utilization',
          averageUtilization: as.targetCPUUtilizationPercentage,
        },
      },
    });
  }

  if (as?.targetMemoryUtilizationPercentage) {
    metrics.push({
      type: 'Resource',
      resource: {
        name: 'memory',
        target: {
          type: 'Utilization',
          averageUtilization: as.targetMemoryUtilizationPercentage,
        },
      },
    });
  }

  return {
    apiVersion: 'autoscaling/v2',
    kind: 'HorizontalPodAutoscaler',
    metadata: {
      name,
      labels: labels(context),
    },
    spec: {
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name,
      },
      minReplicas: as?.minReplicas ?? 1,
      maxReplicas: as?.maxReplicas ?? 100,
      ...(metrics.length ? { metrics } : {}),
    },
  };
}
