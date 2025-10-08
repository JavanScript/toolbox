"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

type TokenType =
  | "string"
  | "number"
  | "identifier"
  | "lbracket"
  | "rbracket"
  | "lparen"
  | "rparen"
  | "comma"
  | "arrow"
  | "semicolon";

type Token = {
  type: TokenType;
  value: string;
};

interface PhpArrayState {
  input: string;
  output: string;
  error: string | null;
}

const SAMPLE_PHP = `<?php
return [
  'name' => 'devtools.io',
  'features' => [
    'client-side',
    'frictionless',
    'private',
  ],
  'meta' => array(
    'launched' => 2025,
    'active' => true,
    'tags' => ['design', 'dx'],
  ),
];`;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  function peek(offset = 0) {
    return input[index + offset];
  }

  function advance(count = 1) {
    index += count;
  }

  function skipWhitespace() {
    while (index < input.length) {
      const char = peek();
      if (/\s/.test(char)) {
        advance();
        continue;
      }
      if (char === "#" || (char === "/" && peek(1) === "/")) {
        while (index < input.length && peek() !== "\n") {
          advance();
        }
        continue;
      }
      if (char === "/" && peek(1) === "*") {
        advance(2);
        while (index < input.length && !(peek() === "*" && peek(1) === "/")) {
          advance();
        }
        advance(2);
        continue;
      }
      break;
    }
  }

  while (index < input.length) {
    skipWhitespace();
    if (index >= input.length) break;
    const char = peek();

    if (char === "'" || char === '"') {
      const quote = char;
      let value = "";
      advance();
      while (index < input.length) {
        const current = peek();
        if (current === "\\") {
          value += current;
          advance();
          if (index < input.length) {
            value += peek();
            advance();
          }
          continue;
        }
        if (current === quote) {
          advance();
          break;
        }
        value += current;
        advance();
      }
      tokens.push({ type: "string", value });
      continue;
    }

    if (/[0-9\-]/.test(char)) {
      let number = char;
      advance();
      while (index < input.length && /[0-9eE\.]/.test(peek())) {
        number += peek();
        advance();
      }
      tokens.push({ type: "number", value: number });
      continue;
    }

    if (/[A-Za-z_]/.test(char)) {
      let ident = char;
      advance();
      while (index < input.length && /[A-Za-z0-9_\\]/.test(peek())) {
        ident += peek();
        advance();
      }
      tokens.push({ type: "identifier", value: ident });
      continue;
    }

    if (char === "[") {
      tokens.push({ type: "lbracket", value: char });
      advance();
      continue;
    }
    if (char === "]") {
      tokens.push({ type: "rbracket", value: char });
      advance();
      continue;
    }
    if (char === "(") {
      tokens.push({ type: "lparen", value: char });
      advance();
      continue;
    }
    if (char === ")") {
      tokens.push({ type: "rparen", value: char });
      advance();
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "comma", value: char });
      advance();
      continue;
    }
    if (char === ";") {
      tokens.push({ type: "semicolon", value: char });
      advance();
      continue;
    }
    if (char === "=" && peek(1) === ">") {
      tokens.push({ type: "arrow", value: "=>" });
      advance(2);
      continue;
    }

    // Skip miscellaneous characters (like PHP open tags, equal signs, etc.)
    advance();
  }

  return tokens;
}

function parsePhpArray(input: string) {
  const tokens = tokenize(input);
  let index = 0;

  function peek() {
    return tokens[index];
  }

  function consume(expected?: TokenType) {
    const token = tokens[index];
    if (!token) {
      throw new Error("Unexpected end of input.");
    }
    if (expected && token.type !== expected) {
      throw new Error(`Expected ${expected} but found ${token.type}.`);
    }
    index += 1;
    return token;
  }

  function parseValue(): unknown {
    const token = peek();
    if (!token) {
      throw new Error("Unexpected end of input.");
    }

    switch (token.type) {
      case "string": {
        consume();
        return token.value.replace(/\\([\\'"nrt])/g, (match, group) => {
          switch (group) {
            case "n":
              return "\n";
            case "r":
              return "\r";
            case "t":
              return "\t";
            case "\\":
              return "\\";
            case "'":
              return "'";
            case '"':
              return '"';
            default:
              return group;
          }
        });
      }
      case "number": {
        consume();
        const numeric = Number(token.value);
        return Number.isFinite(numeric) ? numeric : token.value;
      }
      case "identifier": {
        if (token.value.toLowerCase() === "array") {
          consume();
          consume("lparen");
          const value = parseArray("rparen");
          consume("rparen");
          return value;
        }
        if (token.value.toLowerCase() === "true") {
          consume();
          return true;
        }
        if (token.value.toLowerCase() === "false") {
          consume();
          return false;
        }
        if (token.value.toLowerCase() === "null") {
          consume();
          return null;
        }
        consume();
        return token.value;
      }
      case "lbracket": {
        consume();
        const value = parseArray("rbracket");
        consume("rbracket");
        return value;
      }
      default:
        throw new Error(`Unexpected token ${token.type}.`);
    }
  }

  function parseKey(): string | number {
    const token = peek();
    if (!token) {
      throw new Error("Unexpected end of input while parsing key.");
    }
    if (token.type === "string" || token.type === "identifier") {
      consume();
      return token.value;
    }
    if (token.type === "number") {
      consume();
      const numeric = Number(token.value);
      return Number.isFinite(numeric) ? numeric : token.value;
    }
    throw new Error(`Invalid array key: ${token.type}.`);
  }

  function parseArray(terminator: "rparen" | "rbracket") {
    const items: Array<{ key: string | number | null; value: unknown }> = [];
    let associative = false;

    while (true) {
      const token = peek();
      if (!token || token.type === terminator) {
        break;
      }
      if (token.type === "comma") {
        consume();
        continue;
      }

      let key: string | number | null = null;
      let value: unknown;
      const next = tokens[index + 1];
      if (token && next && next.type === "arrow") {
        key = parseKey();
        consume("arrow");
        value = parseValue();
        associative = true;
      } else {
        value = parseValue();
      }
      items.push({ key, value });

      const after = peek();
      if (after && after.type === "comma") {
        consume();
        continue;
      }
    }

    if (associative) {
      const result: Record<string, unknown> = {};
      for (const item of items) {
        if (item.key == null) {
          throw new Error("Found item without key in associative array.");
        }
        result[String(item.key)] = item.value;
      }
      return result;
    }
    return items.map((item) => item.value);
  }

  const value = parseValue();
  while (peek() && (peek()?.type === "comma" || peek()?.type === "semicolon")) {
    consume();
  }
  if (index < tokens.length) {
    throw new Error("Unexpected tokens after parsing ends.");
  }
  return value;
}

function phpArrayToJson(text: string) {
  const trimmed = text.trim();
  const match = trimmed.match(/(array\s*\(|\[)/);
  if (!match || match.index === undefined) {
    throw new Error("Paste a PHP array literal to convert.");
  }
  const slice = trimmed.slice(match.index);
  const parsed = parsePhpArray(slice);
  return JSON.stringify(parsed, null, 2);
}

export function PhpArrayToJsonConverter() {
  const { value, setValue, reset } = useLocalStorage<PhpArrayState>("tool-php-json", {
    input: SAMPLE_PHP,
    output: phpArrayToJson(SAMPLE_PHP),
    error: null,
  });
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      const input = value.input.trim() || SAMPLE_PHP;
      const output = phpArrayToJson(input);
      setValue({ input, output, error: null });
      notify("Converted PHP array to JSON");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to convert PHP array." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("PHP array converter reset");
  }, [notify, reset]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">PHP array</span>
            <button
              type="button"
              onClick={() => {
                setValue({ input: SAMPLE_PHP, output: phpArrayToJson(SAMPLE_PHP), error: null });
                notify("Sample PHP loaded");
              }}
              className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={value.input}
            onChange={(event) => setValue({ ...value, input: event.target.value, error: null })}
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            placeholder="Paste PHP array literal"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON</span>
            <CopyButton value={value.output} label="Copy" variant="outline" />
          </div>
          <textarea
            value={value.output}
            readOnly
            spellCheck={false}
            className="min-h-[260px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
          />
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Convert to JSON
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
