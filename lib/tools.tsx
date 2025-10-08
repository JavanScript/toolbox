import type { ReactNode } from "react";
import { Base64Tool } from "@/components/tools/base64-tool";
import { CaseConverter } from "@/components/tools/case-converter";
import { ColorFormatConverter } from "@/components/tools/color-format-converter";
import { CronParserTool } from "@/components/tools/cron-parser";
import { CssBoxShadowGenerator } from "@/components/tools/css-box-shadow-generator";
import { CssFormatterTool } from "@/components/tools/css-formatter";
import { CssGradientGenerator } from "@/components/tools/css-gradient-generator";
import { CssUnitConverter } from "@/components/tools/css-unit-converter";
import { CurlToCodeConverter } from "@/components/tools/curl-to-code";
import { DotenvToJsonConverter } from "@/components/tools/dotenv-to-json";
import { EpochDurationTool } from "@/components/tools/epoch-duration";
import { FakeDataGenerator } from "@/components/tools/fake-data-generator";
import { FaviconGenerator } from "@/components/tools/favicon-generator";
import { HtmlFormatterTool } from "@/components/tools/html-formatter";
import { HtmlToJsxConverter } from "@/components/tools/html-to-jsx";
import { HtmlToMarkdownConverter } from "@/components/tools/html-to-markdown";
import { JavaScriptFormatterTool } from "@/components/tools/javascript-formatter";
import { JsonCsvConverter } from "@/components/tools/json-csv-converter";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { JsonYamlConverter } from "@/components/tools/json-yaml-converter";
import { LoremIpsumGenerator } from "@/components/tools/lorem-ipsum-generator";
import { MarkdownToHtmlConverter } from "@/components/tools/markdown-to-html";
import { MetaTagsGenerator } from "@/components/tools/meta-tags-generator";
import { NumberBaseConverter } from "@/components/tools/number-base-converter";
import { PasswordGenerator } from "@/components/tools/password-generator";
import { PhpArrayToJsonConverter } from "@/components/tools/php-array-to-json";
import { QrCodeGenerator } from "@/components/tools/qr-code-generator";
import { QueryParamsToJson } from "@/components/tools/query-params-to-json";
import { SqlFormatterTool } from "@/components/tools/sql-formatter";
import { TimestampConverter } from "@/components/tools/timestamp-converter";
import { UuidGenerator } from "@/components/tools/uuid-generator";
import { XmlFormatterTool } from "@/components/tools/xml-formatter";

export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  keywords: string[];
  component: React.ComponentType;
  icon?: ReactNode;
}

export const toolDefinitions: ToolDefinition[] = [
  {
    id: "json-yaml",
    name: "JSON ↔ YAML Converter",
    category: "Converters",
    headline: "Switch between JSON objects and readable YAML effortlessly.",
    description:
      "Paste JSON or YAML, validate the structure instantly, and round-trip the data without losing formatting.",
    keywords: ["json", "yaml", "converter", "data", "serialization"],
    component: JsonYamlConverter,
  },
  {
    id: "json-csv",
    name: "JSON ↔ CSV Converter",
    category: "Converters",
    headline: "Turn structured JSON arrays into CSV spreadsheets and back.",
    description:
      "Handle tabular data with custom delimiters, keep headers aligned, and copy the result in a single click.",
    keywords: ["json", "csv", "converter", "data", "spreadsheet"],
    component: JsonCsvConverter,
  },
  {
    id: "number-base",
    name: "Number Base Converter",
    category: "Converters",
    headline: "Convert integers across binary, octal, decimal, and hexadecimal instantly.",
    description:
      "Select your source base, validate the digits, and copy normalized output for each base in one view.",
    keywords: ["number", "base", "binary", "hex", "converter"],
    component: NumberBaseConverter,
  },
  {
    id: "query-params",
    name: "Query Params → JSON",
    category: "Converters",
    headline: "Turn URL query strings into structured JSON payloads.",
    description:
      "Paste a full URL or query fragment, decode it safely, and explore the resulting object with copy-friendly output.",
    keywords: ["query", "params", "json", "url", "converter"],
    component: QueryParamsToJson,
  },
  {
    id: "dotenv-json",
    name: "dotenv → JSON Converter",
    category: "Converters",
    headline: "Translate .env files into typed JSON for config pipelines.",
    description:
      "Handle comments, export-style syntax, and blank lines while generating clean JSON you can hydrate elsewhere.",
    keywords: ["dotenv", "json", "env", "converter", "config"],
    component: DotenvToJsonConverter,
  },
  {
    id: "php-array-json",
    name: "PHP Array → JSON",
    category: "Converters",
    headline: "Convert associative PHP arrays into normalized JSON objects.",
    description:
      "Drop in legacy PHP config and receive prettified JSON with robust parsing and error messaging for edge cases.",
    keywords: ["php", "json", "converter", "config", "array"],
    component: PhpArrayToJsonConverter,
  },
  {
    id: "base64",
    name: "Base64 Encoder / Decoder",
    category: "Converters",
    headline: "Convert between text and Base64 without leaving the browser.",
    description:
      "Handle text and binary-safe conversions with clipboard-friendly outputs and decoding safeguards.",
    keywords: ["base64", "encode", "decode", "string"],
    component: Base64Tool,
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    category: "Formatters",
    headline: "Validate, prettify, or compact JSON payloads inline.",
    description:
      "Paste JSON, highlight syntax issues instantly, and copy a prettified or minified version with a single tap.",
    keywords: ["json", "formatter", "validator", "prettify", "beautify"],
    component: JsonFormatter,
  },
  {
    id: "html-formatter",
    name: "HTML Formatter",
    category: "Formatters",
    headline: "Prettify markup with attribute-aware layout controls.",
    description:
      "Use Prettier-powered formatting with tunable print width, tab styles, and attribute wrapping for production-ready HTML.",
    keywords: ["html", "formatter", "prettier", "markup"],
    component: HtmlFormatterTool,
  },
  {
    id: "css-formatter",
    name: "CSS Formatter",
    category: "Formatters",
    headline: "Beautify stylesheets with zero-config Prettier defaults.",
    description:
      "Normalize indentation, quote style, and wrapping for modern CSS while keeping design tokens intact.",
    keywords: ["css", "formatter", "prettier", "styles"],
    component: CssFormatterTool,
  },
  {
    id: "javascript-formatter",
    name: "JavaScript Formatter",
    category: "Formatters",
    headline: "Format scripts with opinionated yet flexible Prettier rules.",
    description:
      "Toggle semicolons, trailing commas, quote styles, and indentation to match your team's JavaScript conventions.",
    keywords: ["javascript", "formatter", "prettier", "code"],
    component: JavaScriptFormatterTool,
  },
  {
    id: "xml-formatter",
    name: "XML Formatter",
    category: "Formatters",
    headline: "Tame verbose XML with collapsible formatting helpers.",
    description:
      "Beautify or minify XML with indentation, self-closing spacing, and content collapsing options for complex documents.",
    keywords: ["xml", "formatter", "prettify", "minify"],
    component: XmlFormatterTool,
  },
  {
    id: "sql-formatter",
    name: "SQL Formatter",
    category: "Formatters",
    headline: "Dialect-aware SQL formatting with keyword casing.",
    description:
      "Support Postgres, MySQL, SQLite, BigQuery, and more with configurable tab width and uppercase keyword toggles.",
    keywords: ["sql", "formatter", "database", "query", "prettify"],
    component: SqlFormatterTool,
  },
  {
    id: "cron-parser",
    name: "Cron Parser",
    category: "Scheduling",
    headline: "Explain cron expressions in approachable language.",
    description:
      "Parse five or six-field cron expressions, view field-by-field breakdowns, and switch between verbose or 24-hour output.",
    keywords: ["cron", "scheduler", "parser", "cronstrue"],
    component: CronParserTool,
  },
  {
    id: "html-to-jsx",
    name: "HTML → JSX Converter",
    category: "Markup",
    headline: "Port raw HTML into React-friendly JSX effortlessly.",
    description:
      "Handle attribute renaming, self-closing tags, and className conversion to slot static markup into React components.",
    keywords: ["html", "jsx", "react", "converter"],
    component: HtmlToJsxConverter,
  },
  {
    id: "html-to-markdown",
    name: "HTML → Markdown",
    category: "Markup",
    headline: "Translate HTML fragments into tidy Markdown prose.",
    description:
      "Convert headings, lists, tables, and inline formatting while keeping code blocks and links intact.",
    keywords: ["html", "markdown", "converter", "content"],
    component: HtmlToMarkdownConverter,
  },
  {
    id: "markdown-to-html",
    name: "Markdown → HTML",
    category: "Markup",
    headline: "Render Markdown into semantic HTML on the fly.",
    description:
      "Preview Markdown posts complete with tables, code fences, and block quotes ready for static site workflows.",
    keywords: ["markdown", "html", "converter", "content"],
    component: MarkdownToHtmlConverter,
  },
  {
    id: "color-format",
    name: "Color Format Converter",
    category: "Design",
    headline: "Jump between HEX, RGB, HSL, and HWB instantly.",
    description:
      "Validate user input, normalize color values, and keep palette exploration snappy for design systems.",
    keywords: ["color", "hex", "rgb", "hsl", "design"],
    component: ColorFormatConverter,
  },
  {
    id: "css-unit",
    name: "CSS Unit Converter",
    category: "CSS",
    headline: "Convert between px, rem, em, and viewport units.",
    description:
      "Define a base font size, explore responsive conversions, and copy values for fluid design work.",
    keywords: ["css", "units", "converter", "responsive"],
    component: CssUnitConverter,
  },
  {
    id: "css-gradient",
    name: "CSS Gradient Generator",
    category: "CSS",
    headline: "Craft layered gradients with live previews and code.",
    description:
      "Blend multiple color stops, shift angles, and copy the resulting background-image snippet instantly.",
    keywords: ["css", "gradient", "design", "generator"],
    component: CssGradientGenerator,
  },
  {
    id: "css-box-shadow",
    name: "CSS Box Shadow Generator",
    category: "CSS",
    headline: "Design soft shadows with layered depth controls.",
    description:
      "Adjust blur, spread, inset, and multiple layers while previewing the final CSS token-ready snippet.",
    keywords: ["css", "shadow", "design", "generator"],
    component: CssBoxShadowGenerator,
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    category: "Time",
    headline: "Translate Unix epochs into readable dates and back again.",
    description:
      "Work across UTC/local time, compare durations, and copy formatted results into your workflow.",
    keywords: ["timestamp", "epoch", "date", "time"],
    component: TimestampConverter,
  },
  {
    id: "epoch-duration",
    name: "Epoch Duration Analyzer",
    category: "Time",
    headline: "Compare two instants and surface human-readable deltas.",
    description:
      "Calculate elapsed time between epochs, view breakdowns by unit, and copy summarized differences.",
    keywords: ["epoch", "duration", "time", "difference"],
    component: EpochDurationTool,
  },
  {
    id: "case-converter",
    name: "Case Converter",
    category: "Text",
    headline: "Translate text between camel, snake, kebab, title, and more.",
    description:
      "Paste any string and grab consistent case variations with copy buttons for each output.",
    keywords: ["text", "case", "camel", "snake", "slug"],
    component: CaseConverter,
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    category: "Text",
    headline: "Produce paragraphs, sentences, or words of classic filler copy.",
    description:
      "Control length, style, and capitalization for placeholder text that matches design mocks.",
    keywords: ["lorem", "ipsum", "text", "generator"],
    component: LoremIpsumGenerator,
  },
  {
    id: "fake-data",
    name: "Fake Data Generator",
    category: "Generators",
    headline: "Generate mock records for prototyping APIs and UIs.",
    description:
      "Configure locale, data types, and record counts to spin up realistic fixtures on demand.",
    keywords: ["faker", "generator", "data", "mock"],
    component: FakeDataGenerator,
  },
  {
    id: "uuid-generator",
    name: "UUID & ULID Generator",
    category: "Generators",
    headline: "Produce collision-resistant identifiers with history and copy controls.",
    description:
      "Generate fresh UUID v4 and ULID pairs, keep the recent set handy, and copy them into your workflow.",
    keywords: ["uuid", "ulid", "identifier", "generator"],
    component: UuidGenerator,
  },
  {
    id: "qr-code",
    name: "QR Code Generator",
    category: "Generators",
    headline: "Create scannable QR codes ready for export.",
    description:
      "Encode any string, adjust error correction levels, and download high-resolution SVG or PNG assets.",
    keywords: ["qr", "code", "generator", "barcode"],
    component: QrCodeGenerator,
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    category: "Design",
    headline: "Design rounded favicons with exportable assets.",
    description:
      "Pick gradients, glyphs, and corner radii while exporting crisp PNGs for light and dark themes.",
    keywords: ["favicon", "icon", "design", "brand"],
    component: FaviconGenerator,
  },
  {
    id: "meta-tags",
    name: "Meta Tags Generator",
    category: "SEO",
    headline: "Assemble social sharing and SEO tags in one place.",
    description:
      "Fill in titles, descriptions, preview images, and open graph metadata with instant HTML snippets.",
    keywords: ["meta", "seo", "open graph", "tags"],
    component: MetaTagsGenerator,
  },
  {
    id: "password-generator",
    name: "Password Generator",
    category: "Security",
    headline: "Generate strong passwords with entropy controls.",
    description:
      "Mix symbols, numbers, upper and lower-case characters with copy buttons and readable strength indicators.",
    keywords: ["password", "security", "generator", "entropy"],
    component: PasswordGenerator,
  },
  {
    id: "curl-to-code",
    name: "cURL → Code",
    category: "Networking",
    headline: "Transform cURL commands into fetch, Axios, and more.",
    description:
      "Paste any cURL command and receive equivalent client code in multiple languages with sensible defaults.",
    keywords: ["curl", "http", "rest", "converter"],
    component: CurlToCodeConverter,
  },
];
