const { bytesToString } = require('helm:helpers');

// Shared helper functions for JS chart manifests
// Helper functions receive context data as parameters from render function

/**
 * Generate standard Kubernetes labels for resources
 * @param {object} chart - Chart metadata
 * @param {object} release - Release metadata
 * @param {string} component - Component name (e.g., 'web', 'api', 'worker')
 * @returns {object} Label object
 */
exports.makeLabels = function(chart, release, component) {
    var labels = {
        'app.kubernetes.io/name': chart.Name,
        'app.kubernetes.io/instance': release.Name,
        'app.kubernetes.io/version': chart.AppVersion,
        'app.kubernetes.io/managed-by': release.Service
    };

    if (component) {
        labels['app.kubernetes.io/component'] = component;
    }

    return labels;
};

/**
 * Generate selector labels (subset of labels used for matching pods)
 * @param {object} chart - Chart metadata
 * @param {object} release - Release metadata
 * @param {string} component - Component name
 * @returns {object} Selector labels
 */
exports.makeSelector = function(chart, release, component) {
    var selector = {
        'app.kubernetes.io/name': chart.Name,
        'app.kubernetes.io/instance': release.Name
    };

    if (component) {
        selector['app.kubernetes.io/component'] = component;
    }

    return selector;
};

/**
 * Generate full resource name with release prefix
 * @param {object} release - Release metadata
 * @param {string} suffix - Suffix to append (e.g., 'web', 'api')
 * @returns {string} Full resource name
 */
exports.fullname = function(release, suffix) {
    if (suffix) {
        return release.Name + '-' + suffix;
    }
    return release.Name;
};

/**
 * Deep merge multiple objects recursively
 * @param {...object} objects - Objects to merge
 * @returns {object} Merged object
 */
exports.deepMerge = function() {
    var result = {};

    /**
     * Helper function to check if value is a plain object
     */
    function isPlainObject(obj) {
        return obj !== null &&
               typeof obj === 'object' &&
               !Array.isArray(obj) &&
               Object.prototype.toString.call(obj) === '[object Object]';
    }

    /**
     * Recursively merge source into target
     */
    function mergeInto(target, source) {
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                var sourceValue = source[key];
                var targetValue = target[key];

                if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
                    // Both are plain objects - merge recursively
                    target[key] = mergeInto(targetValue, sourceValue);
                } else if (isPlainObject(sourceValue)) {
                    // Source is object but target is not - deep copy source
                    target[key] = mergeInto({}, sourceValue);
                } else if (Array.isArray(sourceValue)) {
                    // Arrays are replaced, not merged
                    target[key] = sourceValue.slice();
                } else {
                    // Primitive values or null - replace
                    target[key] = sourceValue;
                }
            }
        }
        return target;
    }

    // Merge all arguments into result
    for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];
        if (isPlainObject(obj)) {
            result = mergeInto(result, obj);
        }
    }

    return result;
};

/**
 * Deep copy a JSON-like object (recursively clone)
 * @param {*} obj - Object to copy
 * @returns {*} Deep copy of the object
 */
exports.deepCopy = function(obj) {
    // Handle null, undefined, and primitives
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle primitives (string, number, boolean)
    if (typeof obj !== 'object') {
        return obj;
    }

    // Handle Array
    if (Array.isArray(obj)) {
        var arrCopy = [];
        for (var i = 0; i < obj.length; i++) {
            arrCopy[i] = exports.deepCopy(obj[i]);
        }
        return arrCopy;
    }

    // Handle plain Object
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        var objCopy = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = exports.deepCopy(obj[key]);
            }
        }
        return objCopy;
    }

    // For other object types (Date, RegExp, etc.), return as-is
    // since they're immutable or require special handling
    return obj;
};

/**
 * Merge multiple objects (shallow merge) - kept for backward compatibility
 * @param {...object} objects - Objects to merge
 * @returns {object} Merged object
 */
exports.merge = function() {
    var result = {};

    for (var i = 0; i < arguments.length; i++) {
        var obj = arguments[i];
        if (obj && typeof obj === 'object') {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
            }
        }
    }

    return result;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
exports.isEmpty = function(value) {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string' && value.trim() === '') {
        return true;
    }
    if (Array.isArray(value) && value.length === 0) {
        return true;
    }
    return false;
};

/**
 * Read a file from chart Files and convert to string
 * @param {object} context - Render context
 * @param {string} fileName - File name/path to read
 * @returns {string} File content as string
 */
exports.readFile = function(context, fileName) {
  const fileData = context.Files[fileName];
  if (!fileData) {
      throw new Error(`File not found: ${fileName}`);
  }
  return bytesToString(fileData);
}
