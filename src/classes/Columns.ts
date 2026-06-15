/**
 * Defines the column mapping for CSV parsing
 */

export interface Columns {
  /** Column index for the date field (1-based) */
  date: number;
  /** Column index for the payee field (1-based) */
  payee: number;
  /** Column index for the category field (1-based) */
  category: number;
  /** Column index for the amount field (1-based) */
  amount: number;
  /** Optional column index for the memo field (1-based) */
  memo: number | null;
  /** Optional column index for the label field (1-based) */
  label: number | null;
  /** Optional column index for the reference field (1-based) */
  reference: number | null;
  /** Column index for the account field (1-based) */
  account: number;
  /** Optional column index for gross total amount field (1-based) */
  gross_amount?: number | null;
  /** Optional column index for gross total currency field (1-based) */
  gross_currency?: number | null;
  /** Optional column index for currency conversion fee amount field (1-based) */
  fee_amount?: number | null;
  /** Optional column index for currency conversion fee currency field (1-based) */
  fee_currency?: number | null;
  /** Optional column index for exchange rate field (1-based) */
  exchange_rate?: number | null;
  /** Optional column index for currency field (1-based) */
  currency?: number | null;
  /** Optional column index for the ticker field (1-based) */
  ticker?: number | null;
  /** Optional column index for the ISIN field (1-based) */
  isin?: number | null;
  /** Optional column index for the security name field (1-based) */
  security_name?: number | null;
  /** Optional column index for the shares field (1-based) */
  shares?: number | null;
  /** Optional column index for the price field (1-based) */
  price?: number | null;
}
