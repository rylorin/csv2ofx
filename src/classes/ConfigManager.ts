import { IConfig } from "config";
import { DateTime } from "luxon";
import { Columns } from "./Columns";

interface Cache<T> {
  value: T;
  timestamp: number;
}

export class ConfigManager {
  private readonly config: IConfig;
  private readonly cacheTTL: number = 10 * 60_000; // 10 minutes in milliseconds
  private readonly cache: Map<string, Cache<any>> = new Map<string, Cache<any>>();

  /**
   * Creates a new ConfigManager instance
   * @param config The application configuration
   */
  constructor(config: IConfig) {
    this.config = config;
  }

  private getCached<T>(key: string, getter: () => T): T {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheTTL) {
      return cached.value as T;
    }

    const value = getter();
    this.cache.set(key, { value, timestamp: now });
    return value;
  }

  /**
   * Gets the column mapping configuration for a specific model
   * @param model The model name to get columns for
   * @returns The column mapping configuration
   */
  public getColumns(model: string): Columns {
    return this.getCached(`columns:${model}`, () => {
      const columns = this.config.get(`models.${model}.columns`);
      if (!columns) {
        throw new Error(`No columns configuration found for model: ${model}`);
      }
      return columns as Columns;
    });
  }

  /**
   * Gets the account identifier from the configuration
   * @returns The account identifier
   */
  public getAccount(): string {
    return this.getCached("account", () => {
      const account = this.config.get("account");
      if (!account) {
        throw new Error("No account configuration found");
      }
      return account as string;
    });
  }

  /**
   * Gets the currency code for a specific model
   * @param account The model name to get currency for
   * @returns The currency code
   */
  public getCurrency(account: string): string {
    return this.getCached(`currency:${account}`, () => {
      const currency = this.config.get(`accounts.${account}.currency`);
      if (!currency) {
        throw new Error(`No currency configuration found for model: ${account}`);
      }
      return currency as string;
    });
  }

  /**
   * Gets the start date for filtering statements
   * @returns The start date as a DateTime object
   */
  public getFromDate(): DateTime {
    return this.getCached("from_date", () => {
      const fromDate = this.config.get<string>("from_date");
      if (!fromDate) {
        throw new Error("No from_date configuration found");
      }
      return DateTime.fromFormat(fromDate as string, "yyyy-MM-dd");
    });
  }

  /**
   * Gets the date format for a specific model
   * @param model The model name to get date format for
   * @returns The date format string
   */
  public getModelDateFormat(model: string): string {
    return this.getCached(`dateFormat:${model}`, () => {
      const dateFormat = this.config.get(`models.${model}.date_format`);
      if (!dateFormat) {
        throw new Error(`No date_format configuration found for model: ${model}`);
      }
      return dateFormat as string;
    });
  }

  /**
   * Gets the delimiter for a specific model
   * @param model The model name to get delimiter for
   * @returns The delimiter string
   */
  public getModelDelimiter(model: string): string {
    return this.getCached(`delimiter:${model}`, () => {
      const delimiter = this.config.get(`models.${model}.delimiter`);
      if (!delimiter) {
        throw new Error(`No delimiter configuration found for model: ${model}`);
      }
      return delimiter as string;
    });
  }

  /**
   * Gets the encoding for a specific model
   * @param model The model name to get encoding for
   * @returns The encoding string
   */
  public getModelEncoding(model: string): BufferEncoding {
    return this.getCached(`encoding:${model}`, () => {
      const encoding = this.config.get<BufferEncoding>(`models.${model}.encoding`);
      if (!encoding) {
        throw new Error(`No encoding configuration found for model: ${model}`);
      }
      return encoding;
    });
  }

  /**
   * Gets the account ID for a specific account
   * @param account The account name to get account ID for
   * @returns The account ID string
   */
  public getAccountId(account: string): string {
    return this.getCached(`acctId:${account}`, () => {
      let acctId = account;
      if (this.config.has(`accounts.${account}.acct_id`))
        acctId = this.config.get<string>(`accounts.${account}.acct_id`);
      return acctId;
    });
  }

  /**
   * Gets the bank ID for a specific account
   * @param account The account name to get bank ID for
   * @returns The bank ID string
   */
  public getBankId(account: string): string {
    return this.getCached(`bankId:${account}`, () => {
      const bankId = this.config.get<string>(`accounts.${account}.bank_id`);
      if (!bankId) {
        throw new Error(`No bank_id configuration found for model: ${account}`);
      }
      return bankId as string;
    });
  }

  /**
   * Gets the starting line number for a specific model
   * @param model The model name to get from line for
   * @returns The starting line number
   */
  public getModelFromLine(model: string): number {
    return this.getCached(`fromLine:${model}`, () => {
      const fromLine = this.config.get<number>(`models.${model}.from_line`);
      if (fromLine === undefined) {
        throw new Error(`No from_line configuration found for model: ${model}`);
      }
      return fromLine as number;
    });
  }

  /**
   * Gets the ending line number for a specific model
   * @param model The model name to get to line for
   * @returns The ending line number
   */
  public getModelToLine(model: string): number | undefined {
    return this.getCached(`toLine:${model}`, () => {
      if (this.config.has(`models.${model}.to_line`)) return this.config.get<number>(`models.${model}.to_line`);
    });
  }
}
