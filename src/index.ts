import { parse } from "csv-parse";
import { DateTime } from "luxon";
import crypto from "node:crypto";
import fs from "node:fs";
import { exit } from "node:process";

// Load env vars
import dotenv from "dotenv";
dotenv.config();

// Load config
import { default as config, IConfig } from "config";

function hashObject(object: Record<string, any>): string {
  if (typeof object != "object") {
    throw new TypeError("Object expected");
  }

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(object), "utf8")
    .digest("hex" as crypto.BinaryToTextEncoding);

  return hash;
}

/**
 * One single statement
 */
interface Statement {
  date: DateTime;
  payee: string;
  category: string;
  amount: number;
  memo: string;
  label: string;
  reference: string;
  account: string;
}

interface Columns {
  date: number;
  payee: number;
  category: number;
  amount: number;
  memo: number;
  label: number;
  reference: number | null;
  account: number;
}

export class App {
  private config: IConfig;
  private model: string | undefined;
  private account: string | undefined;
  private currency: string | undefined;
  private columns: Columns | undefined;
  private fromDate: DateTime | undefined;

  private finalBalance: number = 0;

  constructor(config: IConfig) {
    this.config = config;
  }

  /**
   * Convert a date to OFX format
   * @param datetime date to format
   * @returns date as string
   */
  private formatDate(datetime: DateTime): string {
    return datetime.toFormat("yyyyMMdd");
  }

  private formatString(str: string): string {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  getReference(line: any): string {
    if (this.columns!.reference) {
      const col = this.columns!.reference;
      return line[col];
    } else {
      return hashObject(line);
    }
  }

  getAccount(line: any) {
    const col = this.columns!.account;
    return line[col];
  }

  getLabel(line: any): string {
    const col = this.columns!.label;
    return line[col];
  }

  getMemo(line: any): string {
    const col = this.columns!.memo;
    return line[col];
  }

  getAmount(line: any): number {
    const col = this.columns!.amount;
    return parseFloat(line[col].replaceAll(".", "").replace(",", "."));
  }

  getCategory(line: any): string {
    const col = this.columns!.category;
    return line[col];
  }

  getPayee(line: any): string {
    const col = this.columns!.payee;
    return line[col];
  }

  getDate(line: any): DateTime {
    const col = this.columns!.date;
    const dt = DateTime.fromFormat(
      line[col],
      config.get(`models.${this.model}.dateFormat`)
    );
    return dt;
  }

  /**
   * Returns OFX file header
   * @returns OFX text
   */
  public outputOfxHeader(): string {
    const bankId = this.config.get(`accounts.${this.account}.bankId`);
    const ofx = `<?xml version="1.0" encoding="utf-8" ?>
    <?OFX OFXHEADER="200" VERSION="202" SECURITY="NONE" OLDFILEUID="NONE" NEWFILEUID="NONE"?>
    <OFX>
      <SIGNONMSGSRSV1>
        <SONRS>
          <STATUS>
            <CODE>0</CODE>
            <SEVERITY>INFO</SEVERITY>
          </STATUS>
          <DTSERVER>${this.formatDate(DateTime.now())}</DTSERVER>
          <LANGUAGE>ENG</LANGUAGE>
        </SONRS>
      </SIGNONMSGSRSV1>
      <BANKMSGSRSV1>
        <STMTTRNRS>
          <TRNUID>0</TRNUID>
          <STATUS>
            <CODE>0</CODE>
            <SEVERITY>INFO</SEVERITY>
          </STATUS>
          <STMTRS>
            <CURDEF>${this.currency}</CURDEF>
            <BANKACCTFROM>
              <BANKID>${bankId}</BANKID>
              <ACCTID>${this.account}</ACCTID>
              <ACCTTYPE>CHECKING</ACCTTYPE>
            </BANKACCTFROM>
`;
    return ofx;
  }

  public outputOneStatement(stmt: Statement): string {
    const memo1: string[] = []; // labels + statement memo
    if (stmt.label?.length) {
      memo1.push(
        stmt.label
          .split(",")
          .map((label) => `#${label.replaceAll(" ", "_")}`)
          .join(" ")
      );
    }
    if (stmt.memo && stmt.memo != stmt.payee) {
      memo1.push(this.formatString(stmt.memo));
    }
    const memo2: string[] = []; // category / labels + statement memo
    if (stmt.category.length) memo2.push(stmt.category);
    if (memo1.length) memo2.push(memo1.join(" "));
    let ofx = `              <STMTTRN>
                <TRNTYPE>${stmt.amount >= 0 ? "CREDIT" : "DEBIT"}</TRNTYPE>
                <DTPOSTED>${this.formatDate(stmt.date)}</DTPOSTED>
                <TRNAMT>${stmt.amount}</TRNAMT>
                <FITID>${stmt.reference}</FITID>
                <NAME>${this.formatString(stmt.payee)}</NAME>
`;
    if (memo2.length)
      ofx += `                <MEMO>${memo2.join(" / ")}</MEMO>
`;
    ofx += `              </STMTTRN>
`;
    return ofx;
  }

  /**
   * Returns parsed statements as OFX text
   * @returns OFX text
   */
  public outputOfxStatements(statements: Statement[]): string {
    let dtFrom = statements[0].date;
    let dtTo = statements[0].date;
    statements.forEach((stmt: Statement) => {
      if (stmt.date < dtFrom) {
        dtFrom = stmt.date;
      }
      if (stmt.date > dtTo) {
        dtTo = stmt.date;
      }
      this.finalBalance += stmt.amount;
    });
    let ofx = `            <BANKTRANLIST>
              <DTSTART>${this.formatDate(dtFrom)}</DTSTART>
              <DTEND>${this.formatDate(dtTo)}</DTEND>
`;
    statements.forEach((stmt: Statement) => {
      ofx += this.outputOneStatement(stmt);
    });
    ofx += `            </BANKTRANLIST>
`;
    return ofx;
  }

  /**
   * Returns OFX trailer
   * @param _parsed unused
   * @returns OFX text
   */
  public outputOfxTrailer(): string {
    const ofx = `
            <LEDGERBAL>
              <BALAMT>${this.finalBalance}</BALAMT>
              <DTASOF>${this.formatDate(DateTime.now())}</DTASOF>
            </LEDGERBAL>
          </STMTRS>
        </STMTTRNRS>
      </BANKMSGSRSV1>
    </OFX>
    `;
    return ofx;
  }

  private getColumns(model: string): Columns {
    const columns = {
      date: this.config.get<number>(`models.${model}.columns.date`),
      payee: this.config.get<number>(`models.${model}.columns.payee`),
      category: this.config.get<number>(`models.${model}.columns.category`),
      amount: this.config.get<number>(`models.${model}.columns.amount`),
      memo: this.config.get<number>(`models.${model}.columns.memo`),
      label: this.config.get<number>(`models.${model}.columns.label`),
      reference: this.config.has(`models.${model}.columns.reference`)
        ? this.config.get<number>(`models.${model}.columns.reference`)
        : null,
      account: this.config.get<number>(`models.${model}.columns.account`),
    };
    return columns;
  }

  public async run(model: string, csvFilePath: string, ofxFilePath: string) {
    const statements: Statement[] = [];
    this.model = model;
    this.columns = this.getColumns(model);
    this.account = this.config.get("run.account");
    this.currency = this.config.get(`accounts.${this.account}.currency`);
    if (this.config.has("run.fromDate"))
      this.fromDate = DateTime.fromISO(this.config.get("run.fromDate"));
    const parser = parse({
      delimiter: config.get(`models.${this.model}.delimiter`) as string[1],
      // encoding: config.get("models.encoding") as string,
      from_line: config.get(`models.${this.model}.fromLine`) as number,
      to_line: config.get(`models.${this.model}.toLine`) as number,
      relaxQuotes: true,
    });

    parser
      .on("error", (error: Error) => {
        console.error(error);
        exit(1);
      })
      .on("data", (line: any) => {
        // console.log(line);
        const statement: Statement = {
          date: this.getDate(line),
          payee: this.getPayee(line),
          category: this.getCategory(line),
          amount: this.getAmount(line),
          memo: this.getMemo(line),
          label: this.getLabel(line),
          reference: this.getReference(line),
          account: this.getAccount(line),
        };
        let emit = true;
        if (this.account && this.account != statement.account) {
          emit = false;
        }
        if (this.fromDate && statement.date < this.fromDate) {
          emit = false;
        }
        if (emit) {
          // console.log(statement);
          statements.push(statement);
        }
      })
      .on("end", () => {
        fs.writeFileSync(ofxFilePath, this.outputOfxHeader());
        if (statements.length)
          fs.appendFileSync(ofxFilePath, this.outputOfxStatements(statements));
        fs.appendFileSync(ofxFilePath, this.outputOfxTrailer());
      });
    fs.createReadStream(
      csvFilePath,
      this.config.get(`models.${this.model}.encoding`)
    ).pipe(parser);
  }
}

if (process.argv.length != 5) {
  console.error(
    `Usage: ${process.argv[0]} ${process.argv[1]} model input-file|- output-file|-`
  );
  exit(1);
} else {
  const app = new App(config);
  app
    .run(process.argv[2], process.argv[3], process.argv[4])
    .catch((err: Error) => {
      console.error(err);
      exit(1);
    });
}
