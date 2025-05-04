import { IConfig } from "config";
import { DateTime } from "luxon";
import fs from "node:fs";
import { exit } from "node:process";
import { ConfigManager } from "./classes/ConfigManager";
import { CsvParser } from "./classes/CsvParser";
import { OfxGenerator } from "./classes/OfxGenerator";

// Load env vars
import dotenv from "dotenv";
dotenv.config();

// Load config
import { default as config } from "config";

export class App {
  private configManager: ConfigManager;

  constructor(config: IConfig) {
    this.configManager = new ConfigManager(config);
  }

  public async run(
    model: string,
    csvFilePath: string,
    ofxFilePath: string,
    account?: string,
    fromDate?: string,
  ): Promise<void> {
    // console.log(model, csvFilePath, ofxFilePath, account, fromDate);
    try {
      // Get configuration
      const accountId = account || this.configManager.getAccount();
      const columns = this.configManager.getColumns(model);
      const startDate = fromDate
        ? DateTime.fromFormat(fromDate, "yyyy-MM-dd")
        : this.configManager.getFromDate();

      // Parse CSV
      // console.log(csvFilePath);
      const csvParser = new CsvParser(
        this.configManager,
        model,
        columns,
        accountId,
        startDate,
      );
      const statements = await csvParser.parseCsv(csvFilePath);
      // console.log(ofxFilePath, statements);
      if (statements.length === 0) {
        console.warn("No statements to process!");
        return;
      }

      // Generate OFX
      const ofxGenerator = new OfxGenerator(this.configManager, accountId);
      fs.writeFileSync(ofxFilePath, ofxGenerator.generateHeader());
      fs.appendFileSync(
        ofxFilePath,
        ofxGenerator.generateStatements(statements),
      );
      fs.appendFileSync(ofxFilePath, ofxGenerator.generateTrailer());
    } catch (error) {
      console.error(error);
      exit(1);
    }
  }
}

function parseArgs(args: string[]): {
  model: string;
  input: string;
  output: string;
  account?: string;
  fromDate?: string;
} {
  let model = "";
  let input = "";
  let output = "";
  let account: string | undefined;
  let fromDate: string | undefined;

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--account" && i + 1 < args.length) {
      account = args[i + 1];
      i++; // Skip the next argument
    } else if (arg === "--from-date" && i + 1 < args.length) {
      fromDate = args[i + 1];
      i++; // Skip the next argument
    } else if (!model) {
      model = arg;
    } else if (!input) {
      input = arg;
    } else if (!output) {
      output = arg;
    }
  }

  return { model, input, output, account, fromDate };
}

const args = parseArgs(process.argv);
// console.log(args);

if (!args.model || !args.input || !args.output) {
  console.error(
    `Usage: ${process.argv[0]} ${process.argv[1]} model input-file|- output-file|- [--account account-id] [--from-date YYYY-MM-DD]`,
  );
  exit(1);
} else {
  const app = new App(config);
  app
    .run(args.model, args.input, args.output, args.account, args.fromDate)
    .catch((err: Error) => {
      console.error(err);
      exit(1);
    });
}
