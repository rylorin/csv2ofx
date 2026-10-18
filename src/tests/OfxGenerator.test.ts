import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { ConfigManager } from "../classes/ConfigManager";
import { OfxGenerator } from "../classes/OfxGenerator";
import type { Statement } from "../classes/Statement";
import { defaultTestConfig } from "./mockConfig";

describe("OfxGenerator", () => {
  const configManager = new ConfigManager(defaultTestConfig);
  const generator = new OfxGenerator(configManager, "default");

  const baseStatement: Statement = {
    date: DateTime.fromISO("2026-01-15", { zone: "UTC" }),
    payee: "Supermarché",
    category: "Courses",
    amount: -42.5,
    reference: "REF001",
  };

  it("generateHeader produces a valid OFX header with account info", () => {
    const header = generator.generateHeader();
    expect(header).toContain('<?xml version="1.0" encoding="utf-8" ?>');
    expect(header).toContain("<ACCTID>12345</ACCTID>");
    expect(header).toContain("<BANKID>BANK1</BANKID>");
    expect(header).toContain("<CURDEF>EUR</CURDEF>");
  });

  it("generateStatement escapes special characters in payee", () => {
    const stmt: Statement = { ...baseStatement, payee: "A & B <test>", memo: "memo" };
    const out = generator.generateStatement(stmt);
    expect(out).toContain("A &amp; B &lt;test&gt;");
  });

  it("generateStatement marks negative amounts as DEBIT", () => {
    const out = generator.generateStatement(baseStatement);
    expect(out).toContain("<TRNTYPE>DEBIT</TRNTYPE>");
    expect(out).toContain("<TRNAMT>-42.5</TRNAMT>");
  });

  it("generateStatement marks positive amounts as CREDIT", () => {
    const stmt: Statement = { ...baseStatement, amount: 100 };
    const out = generator.generateStatement(stmt);
    expect(out).toContain("<TRNTYPE>CREDIT</TRNTYPE>");
  });

  it("generateStatements wraps transactions in BANKTRANLIST", () => {
    const out = generator.generateStatements([baseStatement]);
    expect(out).toContain("<BANKTRANLIST>");
    expect(out).toContain("</BANKTRANLIST>");
    expect(out).toContain("<FITID>REF001</FITID>");
  });

  it("generateTrailer closes the OFX document", () => {
    const out = generator.generateTrailer();
    expect(out).toContain("</OFX>");
  });
});
