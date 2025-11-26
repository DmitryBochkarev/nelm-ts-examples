// Deployment manifest using JavaScript
const { makeLabels, makeSelector, fullname } = require('./helpers.js');
const { render: renderSecret } = require('./secret.manifest.js');
const { render: renderConfigMap } = require('./config_map.manifest.js');
const { sha256sum } = require('helm:helpers');

exports.render = function(context) {
    const { Values, Release, Chart } = context;

    // Skip deployment if disabled
    if (!Values.deployment || !Values.deployment.enabled) {
        console.log('Deployment is disabled, skipping');
        return null;
    }

    const componentName = 'web';
    const name = fullname(Release, componentName);
    const labels = makeLabels(Chart, Release, componentName);
    const selector = makeSelector(Chart, Release, componentName);

    // Build container spec
    var containers = [{
        name: componentName,
        image: Values.image.repository + ':' + Values.image.tag,
        imagePullPolicy: Values.image.pullPolicy,
        ports: [{
            name: 'http',
            containerPort: Values.service.targetPort,
            protocol: 'TCP'
        }]
    }];

    // Add environment variables if specified
    if (Values.deployment.env && Array.isArray(Values.deployment.env)) {
        containers[0].env = Values.deployment.env;
    }

    // Add resources if specified
    if (Values.resources) {
        containers[0].resources = Values.resources;
    }

    // Build deployment annotations (merge defaults with user-specified)
    var annotations = {
        'werf.io/weight': '10',  // Deploy after services (default weight 0)
        'werf.io/track-readiness': 'true',  // Track readiness during deployment
        'app.version': Chart.AppVersion,
        'checksum/secrets': sha256sum(JSON.stringify(renderSecret(context))),
        'checksum/config': sha256sum(JSON.stringify(renderConfigMap(context)))
    };

    // Merge user-specified annotations
    if (Values.deployment.annotations) {
        for (var key in Values.deployment.annotations) {
            if (Values.deployment.annotations.hasOwnProperty(key)) {
                annotations[key] = Values.deployment.annotations[key];
            }
        }
    }

    return {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        metadata: {
            name: name,
            namespace: Release.Namespace,
            labels: labels,
            annotations: annotations
        },
        spec: {
            replicas: Values.replicaCount,
            selector: {
                matchLabels: selector
            },
            template: {
                metadata: {
                    labels: labels
                },
                spec: {
                    containers: containers
                }
            }
        }
    };
};
