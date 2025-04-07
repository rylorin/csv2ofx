import { IConfig } from "config";
import { DateTime } from "luxon";
import { Columns } from "./Columns";

export class ConfigManager {
  private readonly config: IConfig;

  /**
   * Creates a new ConfigManager instance
   * @param config The application configuration
   */
  constructor(config: IConfig) {
    this.config = config;
  }

  /**
   * Gets the column mapping configuration for a specific model
   * @param model The model name
   * @returns The column mapping configuration
   * @throws Error if required columns are missing
   */
  public getColumns(model: string): Columns {
    const requiredColumns = [
      "date",
      "payee",
      "category",
      "amount",
      "account",
    ] as const;
    const columns: Partial<Columns> = {};

    // Check required columns
    for (const col of requiredColumns) {
      if (!this.config.has(`models.${model}.columns.${col}`)) {
        throw new Error(`Missing required column configuration: ${col}`);
      }
      columns[col] = this.config.get<number>(`models.${model}.columns.${col}`);
    }

    // Optional columns
    const optionalColumns = ["memo", "label", "reference"] as const;
    for (const col of optionalColumns) {
      columns[col] = this.config.has(`models.${model}.columns.${col}`)
        ? this.config.get<number>(`models.${model}.columns.${col}`)
        : null;
    }

    return columns as Columns;
  }

  /**
   * Gets the account identifier from the configuration
   * @returns The account identifier
   * @throws Error if account is not configured
   */
  public getAccount(): string {
    if (!this.config.has("run.account")) {
      throw new Error("Account not configured");
    }
    return this.config.get<string>("run.account");
  }

  /**
   * Gets the currency code for a specific account
   * @param account The account identifier
   * @returns The currency code
   * @throws Error if currency is not configured for the account
   */
  public getCurrency(account: string): string {
    if (!this.config.has(`accounts.${account}.currency`)) {
      throw new Error(`Currency not configured for account: ${account}`);
    }
    return this.config.get<string>(`accounts.${account}.currency`);
  }

  /**
   * Gets the start date filter from the configuration
   * @returns The start date or undefined if not configured
   */
  public getFromDate(): DateTime | undefined {
    if (this.config.has("run.fromDate")) {
      const dateStr = this.config.get<string>("run.fromDate");
      const date = DateTime.fromISO(dateStr);
      if (!date.isValid) {
        throw new Error(`Invalid fromDate format: ${dateStr}`);
      }
      return date;
    }
    return undefined;
  }

  /**
   * Gets the file encoding for a specific model
   * @param model The model name
   * @returns The file encoding
   * @throws Error if encoding is not configured for the model
   */
  public getModelEncoding(model: string): string {
    if (!this.config.has(`models.${model}.encoding`)) {
      throw new Error(`Encoding not configured for model: ${model}`);
    }
    return this.config.get<string>(`models.${model}.encoding`);
  }
}
