// ConfigMap manifest demonstrating various helm:helpers functions
const { makeLabels, fullname, readFile } = require('./helpers.js');
const { quote } = require('helm:helpers');

exports.render = function(context) {
    const { Values, Release, Chart } = context;

    // Skip configmap if disabled
    if (!Values.configMap.enabled) {
        console.log('ConfigMap is disabled, skipping');
        return null;
    }

    const componentName = 'config';
    const name = fullname(Release, componentName);
    const labels = makeLabels(Chart, Release, componentName);

    // Build config data
    var data = {};

    // Add default configuration
    data['app.conf'] = [
        '# Application Configuration',
        `app.name=${quote(Release.Name)}`,
        `app.version=${quote(Chart.AppVersion)}`,
        `app.environment=${quote(Values.environment || 'production')}`
    ].join('\n');

    // Embed configs/app.yaml from chart files
    data['app.yaml'] = readFile(context, 'configs/app.yaml');


    // Build annotations
    var annotations = {
        'werf.io/weight': '-5',  // Deploy early, but after secrets (weight -10)
    };

    return {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
            name: name,
            namespace: Release.Namespace,
            labels: labels,
            annotations: annotations
        },
        data: data
    };
};
