/**
 * Nelm TypeScript Chart Type Definitions
 *
 * These types define the context object passed to the render() function
 * and the expected return type.
 */

/**
 * The context object passed to the render() function.
 */
export interface RenderContext {
  /**
   * User-provided values merged with chart defaults.
   */
  Values: Values;

  /**
   * Information about the Helm release.
   */
  Release: Release;

  /**
   * Chart metadata from Chart.yaml.
   */
  Chart: ChartMetadata;

  /**
   * Kubernetes cluster capabilities.
   */
  Capabilities: Capabilities;

  /**
   * All files in the chart (excluding templates).
   * Keys are file paths relative to chart root.
   * Values are file contents as Uint8Array.
   */
  Files: Record<string, Uint8Array>;
}

/**
 * User-provided values merged with chart defaults.
 * This interface can be extended to match your values.yaml schema.
 */
export interface Values {
  /** Number of replicas for the deployment */
  replicaCount?: number;

  /** Container image configuration */
  image?: ImageConfig;

  /** Image pull secrets */
  imagePullSecrets?: Array<{ name: string }>;

  /** Override the chart name */
  nameOverride?: string;

  /** Override the full release name */
  fullnameOverride?: string;

  /** Service account configuration */
  serviceAccount?: ServiceAccountConfig;

  /** Pod annotations */
  podAnnotations?: Record<string, string>;

  /** Pod labels */
  podLabels?: Record<string, string>;

  /** Pod security context */
  podSecurityContext?: object;

  /** Container security context */
  securityContext?: object;

  /** Service configuration */
  service?: ServiceConfig;

  /** Ingress configuration */
  ingress?: IngressConfig;

  /** Resource requests and limits */
  resources?: ResourceConfig;

  /** Liveness probe configuration */
  livenessProbe?: ProbeConfig;

  /** Readiness probe configuration */
  readinessProbe?: ProbeConfig;

  /** Autoscaling configuration */
  autoscaling?: AutoscalingConfig;

  /** Volume definitions */
  volumes?: object[];

  /** Volume mount definitions */
  volumeMounts?: object[];

  /** Node selector */
  nodeSelector?: Record<string, string>;

  /** Tolerations */
  tolerations?: object[];

  /** Affinity rules */
  affinity?: object;

  /** Allow any additional values */
  [key: string]: any;
}

export interface ImageConfig {
  repository?: string;
  pullPolicy?: 'Always' | 'IfNotPresent' | 'Never';
  tag?: string;
}

export interface ServiceAccountConfig {
  create?: boolean;
  automount?: boolean;
  annotations?: Record<string, string>;
  name?: string;
}

export interface ServiceConfig {
  type?: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  port?: number;
}

export interface IngressConfig {
  enabled?: boolean;
  className?: string;
  annotations?: Record<string, string>;
  hosts?: IngressHost[];
  tls?: IngressTLS[];
}

export interface IngressHost {
  host: string;
  paths: IngressPath[];
}

export interface IngressPath {
  path: string;
  pathType?: 'Prefix' | 'Exact' | 'ImplementationSpecific';
}

export interface IngressTLS {
  secretName: string;
  hosts: string[];
}

export interface ResourceConfig {
  limits?: {
    cpu?: string;
    memory?: string;
  };
  requests?: {
    cpu?: string;
    memory?: string;
  };
}

export interface ProbeConfig {
  httpGet?: {
    path: string;
    port: string | number;
  };
  tcpSocket?: {
    port: string | number;
  };
  exec?: {
    command: string[];
  };
  initialDelaySeconds?: number;
  periodSeconds?: number;
  timeoutSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface AutoscalingConfig {
  enabled?: boolean;
  minReplicas?: number;
  maxReplicas?: number;
  targetCPUUtilizationPercentage?: number;
  targetMemoryUtilizationPercentage?: number;
}

/**
 * Information about the Helm release.
 */
export interface Release {
  /** The release name */
  Name: string;

  /** The release namespace */
  Namespace: string;

  /** The release revision number */
  Revision: number;

  /** True if this is a fresh install */
  IsInstall: boolean;

  /** True if this is an upgrade */
  IsUpgrade: boolean;

  /** The name of the release service (e.g., "Helm") */
  Service: string;
}

/**
 * Chart metadata from Chart.yaml.
 */
export interface ChartMetadata {
  /** The chart name */
  Name: string;

  /** The chart version */
  Version: string;

  /** The application version */
  AppVersion: string;

  /** Chart description */
  Description?: string;

  /** Chart type: "application" or "library" */
  Type?: string;

  /** Chart API version */
  APIVersion?: string;

  /** Chart keywords */
  Keywords?: string[];

  /** Chart home URL */
  Home?: string;

  /** Chart sources */
  Sources?: string[];

  /** Chart maintainers */
  Maintainers?: Maintainer[];

  /** Chart icon URL */
  Icon?: string;

  /** Deprecated flag */
  Deprecated?: boolean;

  /** Chart annotations */
  Annotations?: Record<string, string>;

  /** Kubernetes version constraint */
  KubeVersion?: string;

  /** Chart dependencies */
  Dependencies?: Dependency[];
}

export interface Maintainer {
  name: string;
  email?: string;
  url?: string;
}

export interface Dependency {
  name: string;
  version: string;
  repository?: string;
  condition?: string;
  tags?: string[];
  enabled?: boolean;
  alias?: string;
}

/**
 * Kubernetes cluster capabilities.
 */
export interface Capabilities {
  /** List of supported API versions */
  APIVersions: string[];

  /** Kubernetes version information */
  KubeVersion: KubeVersion;
}

export interface KubeVersion {
  /** Full version string (e.g., "v1.28.0") */
  Version: string;

  /** Major version number */
  Major: string;

  /** Minor version number */
  Minor: string;
}

/**
 * The expected return type from the render() function.
 */
export interface RenderResult {
  /**
   * Array of Kubernetes manifests to render.
   * Each manifest should be a valid Kubernetes resource object.
   * Return an empty array to skip rendering.
   * Return null to skip TypeScript rendering entirely.
   */
  manifests: object[] | null;
}

/**
 * A generic Kubernetes manifest structure.
 */
export interface Manifest {
  apiVersion: string;
  kind: string;
  metadata: ManifestMetadata;
  spec?: object;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
  [key: string]: any;
}

export interface ManifestMetadata {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
  [key: string]: any;
}

/**
 * Helper module functions available via require('nelm:helpers').
 */
export interface NelmHelpers {
  /** Encode a string to base64 */
  b64enc(str: string): string;

  /** Decode a base64 string */
  b64dec(str: string): string;

  /** Encode a byte array to base64 */
  b64encBytes(bytes: Uint8Array): string;

  /** Decode a base64 string to byte array */
  b64decBytes(str: string): Uint8Array;

  /** Calculate SHA256 hash of a string */
  sha256sum(str: string): string;

  /** Calculate SHA256 hash of a byte array */
  sha256sumBytes(bytes: Uint8Array): string;

  /** Convert byte array to string */
  bytesToString(bytes: Uint8Array): string;

  /** Convert string to byte array */
  stringToBytes(str: string): Uint8Array;
}

declare module 'nelm:helpers' {
  const helpers: NelmHelpers;
  export = helpers;
}
