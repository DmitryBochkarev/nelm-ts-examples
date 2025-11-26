// Secret manifest demonstrating helm:helpers encoding functions
const { b64enc, sha256sum, quote } = require('helm:helpers');
const { fullname } = require('./helpers.js');

exports.render = function(context) {
    const { Values, Release } = context;

    // Skip secret if disabled
    if (!Values.secret || !Values.secret.enabled) {
        console.log('Secret is disabled, skipping');
        return null;
    }

    const name = fullname(Release, 'secret');

    // Encode sensitive data using b64enc
    const encodedPassword = b64enc(Values.secret.password || 'changeme');
    const encodedApiKey = b64enc(Values.secret.apiKey || 'default-api-key');

    // Generate a hash of the secret data (for annotations/labels)
    const dataHash = sha256sum(encodedPassword + encodedApiKey);

    return {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
            name: name,
            namespace: Release.Namespace,
            labels: {
                'app.kubernetes.io/name': Release.Name,
                'app.kubernetes.io/managed-by': Release.Service
            },
            annotations: {
                'werf.io/weight': '-10',  // Deploy before everything else
                'data-hash': dataHash.substring(0, 8)  // Short hash for tracking changes
            }
        },
        type: 'Opaque',
        data: {
            password: encodedPassword,
            'api-key': encodedApiKey
        }
    };
};
