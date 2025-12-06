import _ from 'lodash';

export function render(ctx) {

  function foo() {
    throw new Error('Test error from js-simple chart')
  }

  function boo() {
    return foo()
  }


  // Example usage of lodash
  const labels = _.merge({ app: 'nginx' }, { environment: 'production' });
  const replicaCount = _.clamp(3, 1, 10);

  return {
    apiVersion: 'v1',
    manifests: [
      {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
          name: 'nginx-deployment',
          labels: labels
        },
        spec: {
          replicas: false ?  boo() : replicaCount,
          selector: {
            matchLabels: {
              app: 'nginx'
            }
          },
          template: {
            metadata: {
              labels: {
                app: 'nginx'
              }
            },
            spec: {
              containers: [
                {
                  name: 'nginx',
                  image: 'nginx:1.25',
                  ports: [
                    {
                      containerPort: 80
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ]
  }
}
