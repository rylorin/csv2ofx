#!/usr/bin/env node

// should be at the very beginning to initialize node-config paths before loading
import initConfig from "./config";
initConfig();

import type { Config as IConfig } from "config";
import { DateTime } from "luxon";
import fs from "node:fs";
import { exit } from "node:process";
import { ConfigManager } from "./classes/ConfigManager";
import { CsvGenerator } from "./classes/CsvGenerator";
import { CsvParser } from "./classes/CsvParser";
import { OfxGenerator } from "./classes/OfxGenerator";

// Load config (must be after initConfig sets NODE_CONFIG_DIR)
import { default as config } from "config";

export class App {
  private configManager: ConfigManager;

  constructor(config: IConfig) {
    this.configManager = new ConfigManager(config);
  }

  public async run(
    csvFilePath: string,
    ofxFilePath: string,
    model: string | undefined,
    format: string,
    account: string | undefined,
    fromDate: string | undefined,
    toDate: string | undefined,
  ): Promise<void> {
    // console.log(model, csvFilePath, ofxFilePath, account, fromDate,toDate);
    try {
      if (!account) {
        if (config.has("account")) {
          account = config.get("account");
        }
      }
      if (!account) throw "Account missiog";
      if (!model) {
        if (account && config.has(`accounts.${account}.model`)) {
          model = config.get(`accounts.${account}.model`);
        }
      }
      if (!model) throw "Model missing";

      // Get configuration
      const columns = this.configManager.getColumns(model);

      let startDate: DateTime | undefined;
      try {
        startDate = fromDate ? DateTime.fromFormat(fromDate, "yyyy-MM-dd") : this.configManager.getFromDate();
      } catch {
        // Ignored if not configured
      }

      let endDate: DateTime | undefined;
      try {
        endDate = toDate ? DateTime.fromFormat(toDate, "yyyy-MM-dd") : this.configManager.getToDate();
      } catch {
        // Ignored if not configured
      }

      // Parse CSV
      // console.log(csvFilePath);
      const csvParser = new CsvParser(this.configManager, model, columns, account, startDate, endDate);
      const statements = await csvParser.parseCsv(csvFilePath);
      // console.log(ofxFilePath, statements);
      if (statements.length === 0) {
        console.warn("No statements to process!");
      }

      // Generate Output
      if (format === "csv") {
        const csvGenerator = new CsvGenerator();
        fs.writeFileSync(ofxFilePath, csvGenerator.generate(statements));
      } else {
        const accountIdForOfx = account || this.configManager.getAccount();
        const ofxGenerator = new OfxGenerator(this.configManager, accountIdForOfx);
        fs.writeFileSync(ofxFilePath, ofxGenerator.generateHeader());
        fs.appendFileSync(ofxFilePath, ofxGenerator.generateStatements(statements));
        fs.appendFileSync(ofxFilePath, ofxGenerator.generateTrailer());
      }
    } catch (error) {
      console.error(error);
      exit(1);
    }
  }
}

function parseArgs(args: string[]): {
  model: string | undefined;
  input: string | undefined;
  output: string | undefined;
  format: string;
  account: string | undefined;
  fromDate: string | undefined;
  toDate: string | undefined;
} {
  let model: string | undefined;
  let input: string | undefined;
  let output: string | undefined;
  let format = "ofx";
  let account: string | undefined;
  let fromDate: string | undefined;
  let toDate: string | undefined;

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--account" && i + 1 < args.length) {
      account = args[i + 1];
      i++; // Skip the next argument
    } else if ((arg === "--format" || arg === "-f") && i + 1 < args.length) {
      format = args[i + 1]?.toLowerCase() ?? "ofx";
      i++; // Skip the next argument
    } else if (arg === "--from-date" && i + 1 < args.length) {
      fromDate = args[i + 1];
      i++; // Skip the next argument
    } else if (arg === "--to-date" && i + 1 < args.length) {
      toDate = args[i + 1];
      i++; // Skip the next argument
    } else if (arg === "--model" && i + 1 < args.length) {
      model = args[i + 1];
      i++; // Skip the next argument
    } else if (!input) {
      input = arg;
    } else if (!output) {
      output = arg;
    }
  }

  return { model, input, output, format, account, fromDate, toDate };
}

const args = parseArgs(process.argv);
// console.log(args);

if (!args.input || !args.output) {
  console.error(
    `Usage: ${process.argv[0]} ${process.argv[1]} input-file|- output-file|- [--model model-name] [--format ofx|csv] [--account account-id] [--from-date YYYY-MM-DD] [--to-date YYYY-MM-DD]`,
  );
  exit(1);
} else {
  const app = new App(config);
  app
    .run(args.input, args.output, args.model, args.format, args.account, args.fromDate, args.toDate)
    .catch((err: Error) => {
      console.error(err);
      exit(1);
    });
}
