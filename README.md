# csv2ofx

![Version](https://img.shields.io/github/package-json/v/rylorin/csv2ofx)
[![Publish](https://github.com/rylorin/csv2ofx/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/rylorin/csv2ofx/actions/workflows/npm-publish.yml)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Downloads](https://img.shields.io/npm/dt/csv2ofx.svg)

## Overview

`csv2ofx` is a tool that converts CSV files to OFX format. This is useful for importing financial data into accounting software that supports `OFX` files, like `GnuCash`.
Alternatively it can be used to convert any input CSV files to the CSV format used by PortfolioPerformance.

## Features

- Convert CSV files to OFX format
- Support for multiple CSV formats through configuration
- Filter transactions by account and date
- Support for labels and memos
- Automatic reference generation
- Configurable date formats and delimiters
- **New**: Support for PortfolioPerformance CSV output via `--format csv` option

## Installation

To install `csv2ofx`, you can use check it out from GitHub:

```sh
git clone rylorin/csv2ofx
cd csv2ofx
yarn install
yarn build
```

## Configuration

`csv2ofx` uses a configuration file to define how to parse CSV files and generate OFX output. The configuration is stored in JSON format and supports multiple models for different CSV formats.

### Configuration Structure

```json
{
  "account": "my-account",
  "from_date": "2001-01-01"
  "accounts": {
    "my-account": {
      "acct_id": "123456789",
      "bank_id": "BANK12345",
      "currency": "EUR"
    }
  },
  "models": {
    "my-model": {
      "encoding": "utf-8",
      "delimiter": ";",
      "dateFormat": "dd/MM/yyyy",
      "fromLine": 2,
      "toLine": 1000,
      "columns": {
        "date": 1,
        "payee": 2,
        "category": 3,
        "amount": 4,
        "memo": 5,
        "label": 6,
        "reference": 7,
        "account": 8
      }
    }
  }
}
```

### Configuration Options

#### Run Configuration

- `account`: The account identifier to filter transactions
- `from_date`: Optional start date for filtering transactions (ISO format)

#### Account Configuration

- `accounts.{accountId}.acct_id`: The account identifier for the account
- `accounts.{accountId}.bank_id`: The bank identifier for the account
- `accounts.{accountId}.currency`: The currency code (e.g., EUR, USD)

#### Model Configuration

- `models.{modelName}.encoding`: File encoding (e.g., utf-8, latin1)
- `models.{modelName}.delimiter`: CSV delimiter character
- `models.{modelName}.date_format`: Date format using Luxon format tokens
- `models.{modelName}.from_line`: First line to process (1-based)
- `models.{modelName}.to_line`: Last line to process (1-based)
- `models.{modelName}.columns`: Column mapping configuration

#### Column Configuration

- `columns.date`: Column index for the date field (1-based)
- `columns.payee`: Column index for the payee field (1-based)
- `columns.category`: Column index for the category field (1-based)
- `columns.amount`: Column index for the amount field (1-based)
- `columns.memo`: Optional column index for the memo field (1-based)
- `columns.label`: Optional column index for the label field (1-based)
- `columns.reference`: Optional column index for the reference field (1-based)
- `columns.account`: Column index for the account field (1-based)

### ... and for Trading 212 CSV export format to Porfolio Performance CSV import format

- `columns.fee_amount`: Column index for the conversion fee amount field (1-based)
- `columns.fee_currency`: Column index for the conversion fee currency field (1-based)
- `columns.exchange_rate`: Column index for the exchange rate field (1-based)
- `columns.currency`: Column index for the operation currency field (1-based)
- `columns.ticker`: Column index for the stock ticker symbol field (1-based)
- `columns.isin`: Column index for the ISIN security identifier field (1-based)
- `columns.security_name`: Column index for the security name/text field (1-based)
- `columns.shares`: Column index for the number of shares/units traded field (1-based)
- `columns.price`: Column index for the price per unit/shares field (1-based)

### Example Configurations

#### Basic Configuration

```json
{
  "account": "checking"
  "accounts": {
    "checking": {
      "bank_id": "123456789",
      "currency": "EUR"
    }
  },
  "models": {
    "default": {
      "encoding": "utf-8",
      "delimiter": ",",
      "date_format": "yyyy-MM-dd",
      "from_line": 2,
      "columns": {
        "date": 1,
        "payee": 2,
        "category": 3,
        "amount": 4,
        "account": 5
      }
    }
  }
}
```

#### Advanced Configuration

```json
{
  "account": "savings",
  "from_date": "2024-01-01",
  "accounts": {
    "savings": {
      "bank_id": "987654321",
      "currency": "USD"
    }
  },
  "models": {
    "bank-export": {
      "encoding": "latin1",
      "delimiter": ";",
      "date_format": "dd.MM.yyyy",
      "from_line": 2,
      "to_line": 1000,
      "columns": {
        "date": 1,
        "payee": 2,
        "category": 3,
        "amount": 4,
        "memo": 5,
        "label": 6,
        "reference": 7,
        "account": 8
      }
    }
  }
}
```

## Usage

The command now accepts an optional `--format` (or `-f`) argument to choose the output format. The default format is `ofx`, but you can generate PortfolioPerformance‑compatible CSV files by specifying `--format csv`.

### Basic Usage

```sh
csv2ofx model input.csv output.[ofx|csv]
```

### Examples

1. Convert a CSV file using the default model (OFX output):

```sh
csv2ofx default transactions.csv output.ofx
```

2. Convert a CSV file using a specific model (OFX output):

```sh
csv2ofx bank-export bank_data.csv output.ofx
```

3. Convert a CSV file and filter by date:

```sh
csv2ofx default transactions.csv output.ofx --fromDate 2026-01-01
```

4. Convert a CSV file and filter by account:

```sh
csv2ofx default transactions.csv output.ofx --account savings
```

5. **Generate PortfolioPerformance CSV output**:

```sh
csv2ofx default transactions.csv output.csv --format csv
```

### Options

- `--format ofx|csv` (default: `ofx`) – Choose output format. `csv` produces a PortfolioPerformance‑compatible CSV file.
- `--account account-id` – Optional account filter.
- `--fromDate YYYY-MM-DD` – Optional start date filter.
- `--toDate YYYY-MM-DD` – Optional end date filter.

## CSV Format

When generating CSV output, the tool produces a PortfolioPerformance‑compatible file with the following header:

```text
Date;Type;Note;Symbole boursier;ISIN;Nom du titre;Parts;Frais;Impôts / Taxes;Valeur;Devise de l'opération;Taux de change
```

The parser extracts optional currency conversion fields (exchange rate, fee amount, etc.) from the input file to populate the appropriate columns.

## OFX Output

The generated OFX file will include:

- Account information
- Transaction list with dates, amounts, and references
- Memos combining category and labels
- Final balance

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
