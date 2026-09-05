import { DateTime } from "luxon";
import { formatLabels, formatString } from "../utils/stringUtils";
import type { ConfigManager } from "./ConfigManager";
import type { Statement } from "./Statement";
import { StatementType } from "./Statement";

export class OfxGenerator {
  private readonly configManager: ConfigManager;
  private readonly account: string;
  private finalBalance = 0;

  /**
   * Creates a new OfxGenerator instance
   * @param configManager The configuration manager instance
   * @param account The account identifier
   */
  constructor(configManager: ConfigManager, account: string) {
    this.configManager = configManager;
    this.account = account;
  }

  private formatDate(datetime: DateTime): string {
    return datetime.setZone("local").toFormat("yyyyMMdd");
  }

  /**
   * Generates the OFX file header
   * @returns The OFX header as a string
   */
  public generateHeader(): string {
    const acctId = this.configManager.getAccountId(this.account);
    const bankId = this.configManager.getBankId(this.account);
    const currency = this.configManager.getCurrency(this.account);
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
        <CURDEF>${currency}</CURDEF>
        <BANKACCTFROM>
          <ACCTID>${acctId}</ACCTID>
          <BANKID>${bankId}</BANKID>
          <ACCTTYPE>CHECKING</ACCTTYPE>
        </BANKACCTFROM>
`;
    return ofx;
  }

  /**
   * Generates the OFX representation of a single statement
   * @param stmt The statement to convert to OFX
   * @returns The OFX representation of the statement
   */
  public generateStatement(stmt: Statement): string {
    let name: string = stmt.payee || stmt.memo || stmt.type || "";
    let amount: number = stmt.amount;
    if (stmt.type == StatementType.Buy) {
      name = `Buy ${stmt.shares} ${stmt.ticker} @ ${stmt.price} ${stmt.currency}`;
      amount = -Math.abs(stmt.amount);
    } else if (stmt.type == StatementType.Dividend) {
      name = `Dividend ${stmt.shares} ${stmt.ticker} @ ${stmt.price}`;
    }
    const memo1: string[] = []; // labels + statement memo
    if (stmt.label?.length) {
      memo1.push(formatLabels(stmt.label));
    }
    if (stmt.memo && stmt.memo !== stmt.payee) {
      memo1.push(stmt.memo);
    }
    const memo2: string[] = []; // category / labels + statement memo
    if (stmt.category.length) memo2.push(stmt.category);
    if (memo1.length) memo2.push(memo1.join(" "));
    const memo = memo2.join(" / ");
    let ofx = `              <STMTTRN>
                <TRNTYPE>${amount >= 0 ? "CREDIT" : "DEBIT"}</TRNTYPE>
                <DTPOSTED>${this.formatDate(stmt.date)}</DTPOSTED>
                <TRNAMT>${amount}</TRNAMT>
                <FITID>${stmt.reference}</FITID>
                <NAME>${formatString(name)}</NAME>
`;
    if (memo.length && memo != name)
      ofx += `                <MEMO>${formatString(memo)}</MEMO>
`;
    ofx += `              </STMTTRN>
`;
    return ofx;
  }

  /**
   * Generates the OFX representation of multiple statements
   * @param statements The array of statements to convert to OFX
   * @returns The OFX representation of the statements
   * @throws Error if the statements array is empty
   */
  public generateStatements(statements: Statement[]): string {
    // if (statements.length === 0) {
    //   throw new Error("Cannot generate OFX for empty statements array");
    // }
    let dtFrom: DateTime = this.configManager.getFromDate() ?? DateTime.fromISO("2001-01-01");
    let dtTo = statements.length > 0 ? (statements[0]?.date ?? dtFrom) : dtFrom;
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
      ofx += this.generateStatement(stmt);
    });
    ofx += `            </BANKTRANLIST>
`;
    return ofx;
  }

  /**
   * Generates the OFX file trailer
   * @returns The OFX trailer as a string
   */
  public generateTrailer(): string {
    const ofx = `
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
    `;
    return ofx;
  }
  //   public generateTrailer(): string {
  //     const ofx = `
  //         <LEDGERBAL>
  //           <BALAMT>${this.finalBalance}</BALAMT>
  //           <DTASOF>${this.formatDate(DateTime.now())}</DTASOF>
  //         </LEDGERBAL>
  //       </STMTRS>
  //     </STMTTRNRS>
  //   </BANKMSGSRSV1>
  // </OFX>
  //     `;
  //     return ofx;
  //   }
}
