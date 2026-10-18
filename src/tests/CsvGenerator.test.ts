import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { CsvGenerator } from "../classes/CsvGenerator";
import type { Statement } from "../classes/Statement";

describe("CsvGenerator", () => {
  const generator = new CsvGenerator();

  it("produces the expected CSV header", () => {
    const csv = generator.generate([]);
    expect(csv).toContain("Date;Type;Valeur;Devise de l'opération");
    expect(csv.split("\n")[0]).toBe(
      "Date;Type;Valeur;Devise de l'opération;Montant brut en devise;Taux de change;Note;Symbole boursier;ISIN;Nom du titre;Parts;Frais;Impôts / Taxes",
    );
  });

  it("formats amounts with a comma decimal separator", () => {
    const stmt: Statement = {
      date: DateTime.fromISO("2026-01-15", { zone: "UTC" }),
      payee: "Test",
      category: "Courses",
      amount: -42.5,
      reference: "REF001",
    };
    const csv = generator.generate([stmt]);
    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("-42,5");
  });

  it("uses stmt.type when provided instead of mapping category", () => {
    const stmt: Statement = {
      date: DateTime.fromISO("2026-01-15", { zone: "UTC" }),
      payee: "Test",
      category: "Courses",
      amount: 10,
      reference: "REF002",
      type: "Dividendes",
    };
    const csv = generator.generate([stmt]);
    expect(csv).toContain("Dividendes");
  });
});
