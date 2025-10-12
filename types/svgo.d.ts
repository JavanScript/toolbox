declare module "svgo" {
  export interface OptimizeOptions {
    multipass?: boolean;
    plugins?: unknown[];
    js2svg?: {
      pretty?: boolean;
      indent?: string | number;
    };
  }

  export interface OptimizedSvg {
    data: string;
    info?: {
      width?: string | number;
      height?: string | number;
    };
  }

  export function optimize(svg: string, options?: OptimizeOptions): OptimizedSvg;
}
