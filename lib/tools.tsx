import type { ReactNode } from "react";
import { Base64Tool } from "@/components/tools/base64-tool";
import { CaseConverter } from "@/components/tools/case-converter";
import { JsonCsvConverter } from "@/components/tools/json-csv-converter";
import { JsonFormatter } from "@/components/tools/json-formatter";
import { JsonYamlConverter } from "@/components/tools/json-yaml-converter";
import { NumberBaseConverter } from "@/components/tools/number-base-converter";
import { TimestampConverter } from "@/components/tools/timestamp-converter";
import { UuidGenerator } from "@/components/tools/uuid-generator";

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
    id: "base64",
    name: "Base64 Encoder / Decoder",
    category: "Hashing",
    headline: "Convert between text and Base64 without leaving the browser.",
    description:
      "Handle text and binary-safe conversions with clipboard-friendly outputs and decoding safeguards.",
    keywords: ["base64", "encode", "decode", "string"],
    component: Base64Tool,
  },
  {
    id: "timestamp",
    name: "Timestamp Converter",
    category: "Converters",
    headline: "Translate Unix epochs into readable dates and back again.",
    description:
      "Work across UTC/local time, compare durations, and copy formatted results into your workflow.",
    keywords: ["timestamp", "epoch", "date", "time"],
    component: TimestampConverter,
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
    id: "uuid-generator",
    name: "UUID & ULID Generator",
    category: "Generators",
    headline: "Produce collision-resistant identifiers with history and copy controls.",
    description:
      "Generate fresh UUID v4 and ULID pairs, keep the recent set handy, and copy them into your workflow.",
    keywords: ["uuid", "ulid", "identifier", "generator"],
    component: UuidGenerator,
  },
];
