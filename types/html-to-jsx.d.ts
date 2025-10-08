declare module "html-to-jsx" {
  export default class HTMLtoJSX {
    constructor(options?: { createClass?: boolean; indent?: string });
    convert(html: string): string;
  }
}
