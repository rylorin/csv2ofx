import { DateTime } from "luxon";

/**
 * Represents a single financial statement
 */
export interface Statement {
  /** The date of the transaction */
  date: DateTime;
  /** The payee or recipient of the transaction */
  payee: string;
  /** The category of the transaction */
  category: string;
  /** The amount of the transaction (positive for credits, negative for debits) */
  amount: number;
  /** Optional memo or description of the transaction */
  memo?: string;
  /** Optional labels or tags for the transaction */
  label?: string;
  /** A unique reference for the transaction */
  reference: string;
  /** The account identifier */
  account?: string;
  /** Optional currency conversion fee amount */
  feeAmount?: number;
  /** Optional currency conversion fee currency */
  feeCurrency?: string;
  /** Optional exchange rate */
  exchangeRate?: number;
  /** Optional currency */
  currency?: string;
  /** Optional ticker */
  ticker?: string;
  /** Optional ISIN */
  isin?: string;
  /** Optional security name */
  securityName?: string;
  /** Optional shares */
  shares?: number;
  /** Optional price */
  price?: number;
}
