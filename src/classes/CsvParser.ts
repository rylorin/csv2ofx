import { IConfig } from "config";
import { parse } from "csv-parse";
import { DateTime } from "luxon";
import { hashObject } from "../utils/hashUtils";
import { Columns } from "./Columns";
import { Statement } from "./Statement";

type CsvLine = string[];

export class CsvParser {
  private readonly config: IConfig;
  private readonly model: string;
  private readonly columns: Columns;
  private readonly fromDate?: DateTime;
  private readonly account?: string;

  /**
   * Creates a new CsvParser instance
   * @param config The application configuration
   * @param model The model name to use for parsing
   * @param columns The column mapping configuration
   * @param account Optional account filter
   * @param fromDate Optional date filter
   */
  constructor(
    config: IConfig,
    model: string,
    columns: Columns,
    account?: string,
    fromDate?: DateTime
  ) {
    this.config = config;
    this.model = model;
    this.columns = columns;
    this.account = account;
    this.fromDate = fromDate;
  }

  private getReference(line: CsvLine): string {
    if (this.columns.reference) {
      const col = this.columns.reference - 1;
      return line[col] ?? "";
    } else {
      return hashObject(line);
    }
  }

  private getAccount(line: CsvLine): string {
    const col = this.columns.account - 1;
    return line[col] ?? "";
  }

  private getLabel(line: CsvLine): string | undefined {
    if (this.columns.label) {
      const col = this.columns.label - 1;
      return line[col];
    }
    return undefined;
  }

  private getMemo(line: CsvLine): string | undefined {
    if (this.columns.memo) {
      const col = this.columns.memo - 1;
      return line[col];
    }
    return undefined;
  }

  private getAmount(line: CsvLine): number {
    const col = this.columns.amount - 1;
    const amountStr = line[col] ?? "0";
    return parseFloat(amountStr.replaceAll(".", "").replace(",", "."));
  }

  private getCategory(line: CsvLine): string {
    const col = this.columns.category - 1;
    return line[col] ?? "";
  }

  private getPayee(line: CsvLine): string {
    const col = this.columns.payee - 1;
    return line[col] ?? "";
  }

  private getDate(line: CsvLine): DateTime {
    const col = this.columns.date - 1;
    const dateStr = line[col] ?? "";
    const dt = DateTime.fromFormat(
      dateStr,
      this.config.get(`models.${this.model}.dateFormat`)
    );
    if (!dt.isValid) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    return dt;
  }

  /**
   * Parses a CSV file and returns an array of statements
   * @param csvFilePath The path to the CSV file to parse
   * @returns A promise that resolves to an array of statements
   * @throws Error if the CSV file cannot be parsed
   */
  public async parseCsv(csvFilePath: string): Promise<Statement[]> {
    const statements: Statement[] = [];

    return new Promise((resolve, reject) => {
      const parser = parse({
        delimiter: this.config.get(
          `models.${this.model}.delimiter`
        ) as string[1],
        from_line: this.config.get(`models.${this.model}.fromLine`) as number,
        to_line: this.config.get(`models.${this.model}.toLine`) as number,
        relaxQuotes: true,
      });

      parser
        .on("error", (error: Error) => {
          reject(error);
        })
        .on("data", (line: CsvLine) => {
          try {
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
            if (this.account && this.account !== statement.account) {
              emit = false;
            }
            if (this.fromDate && statement.date < this.fromDate) {
              emit = false;
            }
            if (emit) {
              statements.push(statement);
            }
          } catch (error) {
            console.error(`Error parsing line: ${line.join(",")}`, error);
          }
        })
        .on("end", () => {
          resolve(statements);
        });
    });
  }
}
