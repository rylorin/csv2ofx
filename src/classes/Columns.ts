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
}
