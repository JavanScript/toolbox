declare module "culori" {
  export interface CuloriColor {
    [key: string]: unknown;
  }

  export interface HslColor extends CuloriColor {
    h?: number;
    s?: number;
    l?: number;
  }

  export interface HwbColor extends CuloriColor {
    h?: number;
    w?: number;
    b?: number;
  }

  export function converter(mode: "hsl"): (color: CuloriColor) => HslColor | undefined;
  export function converter(mode: "hwb"): (color: CuloriColor) => HwbColor | undefined;
  export function converter(mode: string): (color: CuloriColor) => CuloriColor | undefined;
  export function formatHex(color: CuloriColor): string;
  export function formatRgb(color: CuloriColor): string;
  export function formatHsl(color: CuloriColor): string;
  export function parse(color: string): CuloriColor | undefined;
}

declare module "qrcode" {
  export interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export interface QRCodeToStringOptions extends QRCodeToDataURLOptions {
    type?: "svg" | "utf8" | "terminal";
  }

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  export function toString(text: string, options?: QRCodeToStringOptions): Promise<string>;

  const QRCode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
  };

  export default QRCode;
}
