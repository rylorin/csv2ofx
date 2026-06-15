import { Statement } from "./Statement";

/**
 * CSV file format generator for Portfolio Performance
 */
export class CsvGenerator {
  private formatDate(datetime: Date): string {
    // const value = datetime.toISOString();
    // const year = parseInt(value.substring(0, 4));
    // const month = parseInt(value.substring(5, 7));
    // const day = parseInt(value.substring(8, 10));
    // const result: string =
    //   year.toString() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    // return result;
    return new Date(datetime).toISOString().substring(0, 16);
  }

  private mapCategoryToType(category: string): string {
    // Map common transaction types to Portfolio Performance French labels
    const catLower = category.toLowerCase().trim();
    if (catLower.includes("buy") || catLower.includes("achat") || catLower.includes("market buy")) {
      return "Achat";
    }
    if (catLower.includes("sell") || catLower.includes("vente") || catLower.includes("market sell")) {
      return "Vente";
    }
    if (catLower.includes("dividend") || catLower.includes("dividende")) {
      return "Dividende";
    }
    if (catLower.includes("interest") || catLower.includes("intérêt") || catLower.includes("interest on cash")) {
      return "Intérêts";
    }
    if (catLower.includes("deposit") || catLower.includes("dépôt")) {
      return "Dépôt";
    }
    if (
      catLower.includes("withdrawal") ||
      catLower.includes("retrait") ||
      catLower.includes("card debit") ||
      catLower.includes("debit")
    ) {
      return "Retrait";
    }
    if (catLower.includes("fee") || catLower.includes("frais")) {
      return "Frais";
    }
    if (catLower.includes("spending cashback")) {
      return "Remboursement de frais";
    }
    // fallback: return original category
    return category;
  }

  public generate(statements: Statement[]): string {
    let csv =
      "Date;Type;Note;Symbole boursier;ISIN;Nom du titre;Parts;Frais;Impôts / Taxes;Valeur;Devise de l'opération;Taux de change\n";
    statements.forEach((stmt) => {
      const date = this.formatDate(stmt.date.toJSDate());
      const category = this.mapCategoryToType(stmt.category || "");
      const ticker = stmt.ticker || "";
      const isin = stmt.isin || "";
      const securityName = stmt.securityName || "";
      const shares = stmt.shares !== undefined ? `${stmt.shares}`.replace(".", ",") : "";
      const _price = stmt.price !== undefined ? `${stmt.price}`.replace(".", ",") : "";
      const fees = stmt.feeAmount !== undefined ? `${stmt.feeAmount}`.replace(".", ",") : "";
      const taxes = ""; // Optional if there's no direct taxes field
      const note = stmt.payee || stmt.memo || stmt.reference || "";
      const currency = stmt.currency || "";
      const exchangeRate = stmt.exchangeRate !== undefined ? `${stmt.exchangeRate}`.replace(".", ",") : "";

      // Convert amount to string
      const amount = `${stmt.amount}`.replace(".", ",");

      csv += `${date};${category};${note};${ticker};${isin};${securityName};${shares};${fees};${taxes};${amount};${currency};${exchangeRate}\n`;
    });
    return csv;
  }
}
