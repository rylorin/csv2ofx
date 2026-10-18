import path from "node:path";
import { describe, expect, it } from "vitest";
import { ConfigManager } from "../classes/ConfigManager";
import { CsvParser } from "../classes/CsvParser";
import { defaultTestConfig } from "./mockConfig";

const samplePath = path.join(__dirname, "data", "sample.csv");

describe("CsvParser", () => {
  it("parses all statements from the static sample CSV", async () => {
    const configManager = new ConfigManager(defaultTestConfig);
    const columns = configManager.getColumns("default");
    const parser = new CsvParser(configManager, "default", columns, "default");
    const statements = await parser.parseCsv(samplePath);
    expect(statements).toHaveLength(3);
  });

  it("maps fields correctly for the first statement", async () => {
    const configManager = new ConfigManager(defaultTestConfig);
    const columns = configManager.getColumns("default");
    const parser = new CsvParser(configManager, "default", columns, "default");
    const statements = await parser.parseCsv(samplePath);
    const first = statements[0]!;
    expect(first.payee).toBe("Supermarché");
    expect(first.category).toBe("Courses");
    expect(first.amount).toBe(-42.5);
    expect(first.memo).toBe("Achat hebdo");
    expect(first.label).toBe("courses");
    expect(first.reference).toBe("REF001");
    expect(first.account).toBe("default");
  });

  it("filters statements by from-date", async () => {
    const configManager = new ConfigManager(defaultTestConfig);
    const columns = configManager.getColumns("default");
    const fromDate = (await import("luxon")).DateTime.fromISO("2026-01-16", { zone: "UTC" });
    const parser = new CsvParser(configManager, "default", columns, "default", fromDate);
    const statements = await parser.parseCsv(samplePath);
    expect(statements).toHaveLength(2);
    expect(statements[0]!.payee).toBe("Salaire");
  });
});
