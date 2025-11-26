// Service manifest using JavaScript
const { makeLabels, makeSelector, fullname } = require('./helpers.js');

exports.render = function(context) {
    const { Values, Release, Chart } = context;

    // Skip service if disabled (using empty helper to check)
    if (!Values.service || !Values.service.enabled) {
        console.log('Service is disabled, skipping');
        return null;
    }

    const componentName = 'web';
    const name = fullname(Release, componentName);
    const labels = makeLabels(Chart, Release, componentName);
    const selector = makeSelector(Chart, Release, componentName);

    // Use default helper to provide fallback values
    const serviceType = Values.service.type || 'ClusterIP';
    const servicePort = Values.service.port || 80;

    // Service gets default weight of 0, so it deploys before deployment (weight 10)
    return {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
            name: name,
            namespace: Release.Namespace,
            labels: labels,
            annotations: {
                'werf.io/weight': '0'  // Deploy first (before deployment)
            }
        },
        spec: {
            type: serviceType,
            ports: [{
                port: servicePort,
                targetPort: Values.service.targetPort,
                protocol: 'TCP',
                name: 'http'
            }],
            selector: selector
        }
    };
};
