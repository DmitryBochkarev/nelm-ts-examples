export interface RenderContext {
  Values: Record<string, any>;
  Release: Release;
  Chart: ChartMetadata;
  Capabilities: Capabilities;
  Files: Record<string, Uint8Array>;
}

export interface Release {
  Name: string;
  Namespace: string;
  Revision: number;
  IsInstall: boolean;
  IsUpgrade: boolean;
  Service: string;
}

export interface ChartMetadata {
  Name: string;
  Version: string;
  AppVersion: string;
}

export interface Capabilities {
  APIVersions: string[];
  KubeVersion: { Version: string; Major: string; Minor: string };
}

export interface RenderResult {
  manifests: object[] | null;
}
