"use client";

import { useCallback } from "react";
import { CopyButton } from "@/components/copy-button";
import { useToast } from "@/components/toast-provider";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ToolButton, ToolError } from "@/components/tools/tool-ui";

interface FakeRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  street: string;
  city: string;
  country: string;
}

interface FakeDataState {
  count: number;
  seed: string;
  records: FakeRecord[];
  json: string;
  csv: string;
  error: string | null;
}

const FIRST_NAMES = [
  "Aiden",
  "Maya",
  "Rowan",
  "Noah",
  "Harper",
  "Elliot",
  "Lena",
  "Kai",
  "Aria",
  "Theo",
  "Zara",
  "Milo",
  "Lyra",
  "Nova",
  "Orion",
  "Rhea",
  "Soren",
  "Tessa",
];

const LAST_NAMES = [
  "Hart",
  "Rivers",
  "Felix",
  "Stone",
  "Lane",
  "Morrison",
  "Gardner",
  "Hayes",
  "Summers",
  "Ellis",
  "Kerr",
  "Lambert",
  "Holland",
  "Perry",
  "Reed",
  "Shepherd",
  "Whitaker",
  "Young",
];

const COMPANY_WORDS = [
  "Lumen",
  "Atlas",
  "Parallel",
  "Signal",
  "Vector",
  "Nimbus",
  "Forge",
  "Arc",
  "Pulse",
  "North",
  "Frontier",
  "Beacon",
  "Delta",
  "Coda",
  "Orbit",
  "Frame",
  "Canvas",
  "Origin",
];

const JOB_TITLES = [
  "Product Designer",
  "Frontend Engineer",
  "Platform Lead",
  "Staff Engineer",
  "Product Manager",
  "Design Technologist",
  "QA Specialist",
  "Developer Advocate",
  "Site Reliability",
  "Solutions Architect",
  "UX Researcher",
];

const CITIES = [
  { city: "San Francisco", country: "USA" },
  { city: "Berlin", country: "Germany" },
  { city: "Tokyo", country: "Japan" },
  { city: "Lisbon", country: "Portugal" },
  { city: "Melbourne", country: "Australia" },
  { city: "Toronto", country: "Canada" },
  { city: "Stockholm", country: "Sweden" },
  { city: "Tallinn", country: "Estonia" },
  { city: "Singapore", country: "Singapore" },
  { city: "Buenos Aires", country: "Argentina" },
  { city: "London", country: "United Kingdom" },
];

function mulberry32(seed: number) {
  return function random() {
    let t = seed += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, list: T[]): T {
  const index = Math.floor(random() * list.length);
  return list[index];
}

function pad(value: number, length: number) {
  return value.toString().padStart(length, "0");
}

function generateRecords(count: number, seed: string): FakeRecord[] {
  const baseSeed = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = mulberry32(baseSeed || Date.now());
  const records: FakeRecord[] = [];

  for (let index = 0; index < count; index += 1) {
    const first = pick(random, FIRST_NAMES);
    const last = pick(random, LAST_NAMES);
    const companyWord = pick(random, COMPANY_WORDS);
    const city = pick(random, CITIES);
    const companySuffix = ["Labs", "Systems", "Works", "Collective", "Studios"][Math.floor(random() * 5)] ?? "Studio";
    const job = pick(random, JOB_TITLES);
    const number = Math.floor(random() * 900 + 100);
    const streetName = `${pick(random, COMPANY_WORDS)} Street`;
    const phone = `+1-${pad(Math.floor(random() * 900) + 100, 3)}-${pad(
      Math.floor(random() * 900) + 100,
      3
    )}-${pad(Math.floor(random() * 9000) + 1000, 4)}`;
    const id = `${Date.now()}-${index}-${Math.floor(random() * 1000)}`;
    const company = `${companyWord} ${companySuffix}`;
    const emailDomain = `${companyWord.toLowerCase()}${Math.floor(random() * 9) + 1}.io`;
    const email = `${first}.${last}@${emailDomain}`.toLowerCase();

    records.push({
      id,
      name: `${first} ${last}`,
      email,
      company,
      title: job,
      phone,
      street: `${number} ${streetName}`,
      city: city.city,
      country: city.country,
    });
  }

  return records;
}

function toCsv(records: FakeRecord[]) {
  const headers = ["id", "name", "email", "company", "title", "phone", "street", "city", "country"];
  const lines = [headers.join(",")];
  for (const record of records) {
    const row = headers
      .map((header) => {
        const value = (record[header as keyof FakeRecord] as string | undefined) ?? "";
        if (value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",");
    lines.push(row);
  }
  return lines.join("\n");
}

function createInitialState(): FakeDataState {
  const records = generateRecords(5, "devtools");
  return {
    count: 5,
    seed: "devtools",
    records,
    json: JSON.stringify(records, null, 2),
    csv: toCsv(records),
    error: null,
  };
}

export function FakeDataGenerator() {
  const { value, setValue, reset } = useLocalStorage<FakeDataState>("tool-fake-data", createInitialState());
  const { notify } = useToast();

  const run = useCallback(() => {
    try {
      if (value.count < 1 || value.count > 50) {
        throw new Error("Count must be between 1 and 50 records.");
      }
      const records = generateRecords(value.count, value.seed || `${Date.now()}`);
      setValue({
        ...value,
        records,
        json: JSON.stringify(records, null, 2),
        csv: toCsv(records),
        error: null,
      });
      notify("Fake data generated");
    } catch (error) {
      setValue({ ...value, error: error instanceof Error ? error.message : "Unable to generate data." });
    }
  }, [notify, setValue, value]);

  const handleReset = useCallback(() => {
    reset();
    notify("Fake data generator reset");
  }, [notify, reset]);

  const handleSeedShuffle = useCallback(() => {
    const seed = Math.random().toString(36).slice(2, 8);
    setValue({ ...value, seed, error: null });
    notify("Seed randomized");
  }, [notify, setValue, value]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Records</span>
            <input
              type="number"
              min={1}
              max={50}
              value={value.count}
              onChange={(event) => setValue({ ...value, count: Number(event.target.value), error: null })}
              className="w-20 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-right font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
            />
          </label>
          <label className="flex items-center justify-between rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(8,10,16,0.82)] px-5 py-4 text-sm text-[var(--foreground-muted)]">
            <span className="text-xs uppercase tracking-[0.3em]">Seed</span>
            <input
              value={value.seed}
              onChange={(event) => setValue({ ...value, seed: event.target.value, error: null })}
              className="w-32 rounded-2xl border border-[var(--surface-border)]/60 bg-[rgba(10,12,20,0.9)] px-3 py-2 text-right font-mono text-sm text-[var(--foreground)] focus:border-[var(--accent)]/60 focus:outline-none"
              placeholder="optional"
            />
          </label>
          <div className="flex items-center justify-end gap-3">
            <ToolButton type="button" onClick={handleSeedShuffle} variant="secondary">
              Shuffle seed
            </ToolButton>
          </div>
          <button
            type="button"
            onClick={() => {
              const preset = createInitialState();
              setValue({ ...preset });
              notify("Preset loaded");
            }}
            className="text-left text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--accent)] transition hover:text-[#6baeff]"
          >
            Load dev team preset
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)]">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)]/60 px-5 py-4">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">Records</span>
              <CopyButton value={value.csv} label="Copy CSV" variant="ghost" />
            </div>
            <div className="max-h-[280px] overflow-auto">
              <table className="min-w-full divide-y divide-[var(--surface-border)]/40 text-left text-sm">
                <thead className="bg-[rgba(8,10,16,0.88)] text-[11px] uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--surface-border)]/30">
                  {value.records.map((record) => (
                    <tr key={record.id} className="bg-[rgba(10,12,20,0.65)]">
                      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{record.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[var(--accent)]">{record.email}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{record.company}</td>
                      <td className="px-4 py-3 text-[var(--foreground-muted)]">{record.title}</td>
                      <td className="px-4 py-3 text-[var(--foreground-muted)]">
                        {record.city}, {record.country}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-[var(--foreground-muted)]">JSON output</span>
              <CopyButton value={value.json} label="Copy JSON" variant="outline" />
            </div>
            <textarea
              value={value.json}
              readOnly
              spellCheck={false}
              className="min-h-[180px] w-full resize-y rounded-3xl border border-[var(--surface-border)]/60 bg-[rgba(6,8,14,0.78)] p-5 font-mono text-sm text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {value.error ? <ToolError message={value.error} /> : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ToolButton type="button" onClick={run}>
          Generate data
        </ToolButton>
        <ToolButton type="button" onClick={handleReset} variant="ghost">
          Reset tool
        </ToolButton>
      </div>
    </div>
  );
}
