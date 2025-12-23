import { RenderContext } from '../types/nelm';
import { fullname, labels, selectorLabels } from './helpers';

export function newDeployment($: RenderContext): object {
  const name = fullname($);

  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name,
      labels: labels($),
    },
    spec: {
      replicas: $.Values.replicaCount ?? 1,
      selector: {
        matchLabels: selectorLabels($),
      },
      template: {
        metadata: {
          labels: selectorLabels($),
        },
        spec: {
          containers: [
            {
              name: name,
              image: `${$.Values.image?.repository}:${$.Values.image?.tag}`,
              ports: [
                {
                  name: 'http',
                  containerPort: $.Values.service?.port ?? 80,
                },
              ],
            },
          ],
        },
      },
    },
  };
}

export function newService($: RenderContext): object {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: fullname($),
      labels: labels($),
    },
    spec: {
      type: $.Values.service?.type ?? 'ClusterIP',
      ports: [
        {
          port: $.Values.service?.port ?? 80,
          targetPort: 'http',
        },
      ],
      selector: selectorLabels($),
    },
  };
}
