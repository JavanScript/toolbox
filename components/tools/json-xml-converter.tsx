"use client";

import { useCallback } from "react";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface JsonXmlState {
  jsonInput: string;
  xmlInput: string;
  error: string | null;
}

const XML_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  allowBooleanAttributes: true,
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
};

const SAMPLE_OBJECT = {
  service: {
    name: "devtools.io",
    description: "Utilities for designers and developers",
    tags: {
      tag: ["design", "performance", "privacy"],
    },
    version: {
      "@stable": false,
      "#text": "1.0.0-alpha",
    },
  },
};

const builder = new XMLBuilder(XML_OPTIONS);
const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(SAMPLE_OBJECT)}`;
const SAMPLE_JSON = JSON.stringify(SAMPLE_OBJECT, null, 2);

export function JsonXmlConverter() {
  const { value, setValue, reset } = useLocalStorage<JsonXmlState>("tool-json-xml", {
    jsonInput: SAMPLE_JSON,
    xmlInput: SAMPLE_XML,
    error: null,
  });
  const { notify } = useToast();

  const handleJsonToXml = useCallback(() => {
    try {
      const clean = value.jsonInput.trim();
      const parsed = clean ? JSON.parse(clean) : {};
      const localBuilder = new XMLBuilder(XML_OPTIONS);
      const xmlBody = localBuilder.build(parsed);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlBody}`;
      setValue({ jsonInput: value.jsonInput, xmlInput: xml, error: null });
      notify("Converted JSON to XML");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse JSON." });
    }
  }, [notify, setValue, value]);

  const handleXmlToJson = useCallback(() => {
    try {
      const clean = value.xmlInput.trim();
      if (!clean) {
        setValue({ jsonInput: "{}", xmlInput: value.xmlInput, error: null });
        notify("Converted XML to JSON");
        return;
      }

      const parser = new XMLParser({ ...XML_OPTIONS, ignoreDeclaration: true });
      const parsed = parser.parse(clean);
      const json = JSON.stringify(parsed, null, 2);
      setValue({ jsonInput: json, xmlInput: value.xmlInput, error: null });
      notify("Converted XML to JSON");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to parse XML." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("JSON ↔ XML reset");
  }, [notify, reset]);

  const handleLoadSample = useCallback(() => {
    setValue({ jsonInput: SAMPLE_JSON, xmlInput: SAMPLE_XML, error: null });
    notify("Sample JSON loaded");
  }, [notify, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.jsonInput}
            onChange={(event) => setValue({ ...value, jsonInput: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste JSON"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">XML</span>
            <CopyButton value={value.xmlInput} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.xmlInput}
            onChange={(event) => setValue({ ...value, xmlInput: event.target.value })}
            spellCheck={false}
            className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste XML"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleJsonToXml}>
          Convert to XML
        </ToolButton>
        <ToolButton type="button" onClick={handleXmlToJson} variant="secondary">
          Convert to JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
