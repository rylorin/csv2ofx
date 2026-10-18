import type { Config as IConfig } from "config";

/**
 * Builds a minimal mock of node-config's IConfig from a plain nested object.
 * Resolves dot-separated paths (e.g. "models.default.columns") and supports `has`.
 */
export function makeConfig(data: Record<string, unknown>): IConfig {
  const resolve = (path: string): unknown => {
    const parts = path.split(".");
    let cur: unknown = data;
    for (const part of parts) {
      if (cur && typeof cur === "object") {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const get = <T>(path: string): T => {
    const value = resolve(path);
    if (value === undefined) {
      throw new Error(`No config value for: ${path}`);
    }
    return value as T;
  };

  const has = (path: string): boolean => resolve(path) !== undefined;

  return { get, has } as unknown as IConfig;
}

export const defaultTestConfig = makeConfig({
  account: "default",
  from_date: "2001-01-01",
  accounts: {
    default: {
      model: "default",
      acct_id: "12345",
      bank_id: "BANK1",
      currency: "EUR",
    },
  },
  models: {
    default: {
      delimiter: ";",
      encoding: "utf8",
      date_format: "yyyy-MM-dd",
      from_line: 2,
      separator: ".",
      columns: {
        date: 1,
        payee: 2,
        category: 3,
        amount: 4,
        memo: 5,
        label: 6,
        reference: 7,
        account: 8,
      },
    },
  },
});
