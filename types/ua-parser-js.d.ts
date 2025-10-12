declare module "ua-parser-js" {
  export interface IBrowser {
    name?: string;
    version?: string;
    major?: string;
  }

  export interface IEngine {
    name?: string;
    version?: string;
  }

  export interface IOS {
    name?: string;
    version?: string;
  }

  export interface IDevice {
    model?: string;
    type?: string;
    vendor?: string;
  }

  export interface ICPU {
    architecture?: string;
  }

  export interface IResult {
    ua: string;
    browser: IBrowser;
    engine: IEngine;
    os: IOS;
    device: IDevice;
    cpu: ICPU;
  }

  export default class UAParser {
    constructor(ua?: string);
    setUA(ua: string): UAParser;
    getUA(): string;
    getResult(): IResult;
  }
}
