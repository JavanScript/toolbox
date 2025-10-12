"use client";

import { useEffect, useMemo, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface JwtDebuggerState {
  token: string;
  secret: string;
}

interface JwtParts {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  rawHeader: string;
  rawPayload: string;
  error: string | null;
}

type VerificationStatus = "idle" | "pending" | "pass" | "fail" | "unsupported" | "missing";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldiBUb29sYm94IiwiaWF0IjoxNTE2MjM5MDIyfQ." +
  "PCznwJ6d8tiTnrW5Rh6Msf4kFDxioClTp8xerA66h4I";

function normalizeBase64(value: string) {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }
  return base64;
}

function base64UrlDecode(value: string) {
  try {
    if (typeof window === "undefined") return "";
    return window.atob(normalizeBase64(value));
  } catch (cause) {
    throw new Error("Invalid base64 segment");
  }
}

function base64UrlToUint8Array(value: string) {
  if (typeof window === "undefined") return new Uint8Array();
  const binary = window.atob(normalizeBase64(value));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch (cause) {
    throw new Error("Segment is not valid JSON");
  }
}

function decodeJwt(token: string): JwtParts {
  const trimmed = token.trim();
  if (!trimmed) {
    return { header: null, payload: null, signature: "", rawHeader: "", rawPayload: "", error: null };
  }

  const segments = trimmed.split(".");
  if (segments.length < 2) {
    return { header: null, payload: null, signature: "", rawHeader: "", rawPayload: "", error: "JWT must contain header and payload segments" };
  }

  try {
    const rawHeader = base64UrlDecode(segments[0]);
    const rawPayload = base64UrlDecode(segments[1]);
    const header = parseJson(rawHeader);
    const payload = parseJson(rawPayload);
    const signature = segments[2] ?? "";

    return { header, payload, signature, rawHeader, rawPayload, error: null };
  } catch (error) {
    return {
      header: null,
      payload: null,
      signature: "",
      rawHeader: "",
      rawPayload: "",
      error: error instanceof Error ? error.message : "Unable to decode JWT",
    };
  }
}

interface ClaimStatus {
  label: string;
  value: string;
  state: "valid" | "expired" | "not-yet";
}

function analyzeClaims(payload: Record<string, unknown> | null): ClaimStatus[] {
  if (!payload) return [];
  const now = Math.floor(Date.now() / 1000);
  const statuses: ClaimStatus[] = [];

  if (typeof payload.exp === "number") {
    statuses.push({
      label: "Expires",
      value: new Date(payload.exp * 1000).toISOString(),
      state: payload.exp >= now ? "valid" : "expired",
    });
  }

  if (typeof payload.nbf === "number") {
    statuses.push({
      label: "Not before",
      value: new Date(payload.nbf * 1000).toISOString(),
      state: payload.nbf <= now ? "valid" : "not-yet",
    });
  }

  if (typeof payload.iat === "number") {
    statuses.push({
      label: "Issued",
      value: new Date(payload.iat * 1000).toISOString(),
      state: payload.iat <= now ? "valid" : "not-yet",
    });
  }

  return statuses;
}

type SupportedHmac = "HS256" | "HS384" | "HS512";

function isSupportedHmac(value: string): value is SupportedHmac {
  return value === "HS256" || value === "HS384" || value === "HS512";
}

async function verifyJwtSignature(token: string, secret: string, algorithm: string) {
  const supported: Record<SupportedHmac, string> = {
    HS256: "SHA-256",
    HS384: "SHA-384",
    HS512: "SHA-512",
  };

  if (!isSupportedHmac(algorithm)) {
    return { status: "unsupported" as VerificationStatus, message: `Verification not available for ${algorithm}` };
  }

  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return { status: "unsupported" as VerificationStatus, message: "Web Crypto API not available" };
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    return { status: "missing" as VerificationStatus, message: "Token missing signature segment" };
  }

  try {
    const encoder = new TextEncoder();
    const importedKey = await window.crypto.subtle.importKey(
      "raw",
  encoder.encode(secret),
  { name: "HMAC", hash: { name: supported[algorithm] } },
      false,
      ["sign", "verify"]
    );

    const data = encoder.encode(`${header}.${payload}`);
  const decodedSignature = base64UrlToUint8Array(signature);
  const verified = await window.crypto.subtle.verify("HMAC", importedKey, decodedSignature, data);
    return verified
      ? { status: "pass" as VerificationStatus, message: "Signature valid" }
      : { status: "fail" as VerificationStatus, message: "Signature invalid" };
  } catch (error) {
    console.warn("JWT verification failed", error);
    return { status: "fail" as VerificationStatus, message: "Verification error" };
  }
}

export function JwtDebugger() {
  const { value, setValue, reset } = useLocalStorage<JwtDebuggerState>("tool-jwt-debugger", {
    token: SAMPLE_JWT,
    secret: "",
  });
  const { notify } = useToast();

  const decoded = useMemo(() => decodeJwt(value.token), [value.token]);
  const claims = useMemo(() => analyzeClaims(decoded.payload), [decoded.payload]);
  const [verification, setVerification] = useState<{ status: VerificationStatus; message?: string }>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;

    const runVerification = async () => {
      if (!decoded.header || !decoded.signature) {
        setVerification({ status: decoded.signature ? "missing" : "idle" });
        return;
      }

      const algorithm = typeof decoded.header.alg === "string" ? decoded.header.alg : "";
      if (!algorithm || !value.secret) {
        setVerification({ status: value.secret ? "unsupported" : "idle" });
        return;
      }

      setVerification({ status: "pending" });
      const result = await verifyJwtSignature(value.token, value.secret, algorithm);
      if (!cancelled) {
        setVerification(result);
      }
    };

    runVerification();
    return () => {
      cancelled = true;
    };
  }, [decoded.header, decoded.signature, value.secret, value.token]);

  const handleReset = () => {
    reset();
    setVerification({ status: "idle" });
    notify("JWT debugger reset");
  };

  const headerJson = decoded.header ? JSON.stringify(decoded.header, null, 2) : "";
  const payloadJson = decoded.payload ? JSON.stringify(decoded.payload, null, 2) : "";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JWT token</span>
              <CopyButton value={value.token} label="Copy" variant="outline" />
            </div>
            <textarea
              value={value.token}
              onChange={(event) => setValue({ ...value, token: event.target.value })}
              spellCheck={false}
              className="min-h-[220px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-5 font-mono text-xs text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="Paste JWT token"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Secret (for HS* verification)</span>
              <input
                value={value.secret}
                onChange={(event) => setValue({ ...value, secret: event.target.value })}
                className="w-full rounded-xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.65)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
                placeholder="Optional"
                type="password"
              />
            </label>

            <div className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Verification</span>
              <p
                className={`rounded-2xl border px-4 py-3 text-xs uppercase tracking-[0.3em] ${
                  {
                    idle: "border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.72)] text-[var(--foreground-muted)]",
                    pending: "border-[var(--accent)]/40 bg-[rgba(88,166,255,0.16)] text-[var(--accent)]",
                    pass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                    fail: "border-red-500/40 bg-red-500/10 text-red-300",
                    unsupported: "border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.72)] text-[var(--foreground-muted)]",
                    missing: "border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.72)] text-[var(--foreground-muted)]",
                  }[verification.status]
                }`}
              >
                {verification.message ||
                  {
                    idle: "Waiting for secret",
                    pending: "Verifying signature",
                    pass: "Signature valid",
                    fail: "Signature invalid",
                    unsupported: "Verification unavailable",
                    missing: "Missing signature segment",
                  }[verification.status]}
              </p>
            </div>
          </div>

          {claims.length > 0 ? (
            <div className="space-y-3 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 text-sm text-[var(--foreground)]">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Token timeline</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {claims.map((claim) => (
                  <div
                    key={claim.label}
                    className={`rounded-2xl border px-4 py-3 text-xs uppercase tracking-[0.3em] ${
                      {
                        valid: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                        expired: "border-red-500/40 bg-red-500/10 text-red-200",
                        "not-yet": "border-[var(--accent)]/40 bg-[rgba(88,166,255,0.12)] text-[var(--accent)]",
                      }[claim.state]
                    }`}
                  >
                    <span className="block text-[var(--foreground)]">{claim.label}</span>
                    <span className="mt-2 block text-[var(--foreground-muted)] normal-case">{claim.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Decoded header</p>
            {headerJson ? <CopyButton value={headerJson} label="Copy JSON" variant="outline" /> : null}
          </div>

          {decoded.error ? <ToolError message={decoded.error} /> : null}

          <div className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs text-[var(--foreground)]">
            <pre className="whitespace-pre-wrap break-words font-mono">{headerJson || "Awaiting token"}</pre>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Decoded payload</p>
            {payloadJson ? <CopyButton value={payloadJson} label="Copy JSON" variant="outline" /> : null}
          </div>
          <div className="rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] p-4 text-xs text-[var(--foreground)]">
            <pre className="whitespace-pre-wrap break-words font-mono">{payloadJson || "Awaiting token"}</pre>
          </div>

          <div className="space-y-2 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-4 py-3 text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">
            <span>Signature</span>
            <span className="break-all font-mono text-[var(--foreground)]">{decoded.signature || "--"}</span>
            {decoded.signature ? <CopyButton value={decoded.signature} label="Copy signature" variant="ghost" /> : null}
          </div>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
