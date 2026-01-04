# csv2ofx

## Overview

`csv2ofx` is a tool that converts CSV files to OFX format. This is useful for importing financial data into accounting software that supports `OFX` files, like `GnuCash`.

## Features

- Convert CSV files to OFX format
- Support for multiple CSV formats through configuration
- Filter transactions by account and date
- Support for labels and memos
- Automatic reference generation
- Configurable date formats and delimiters

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

### Basic Usage

```sh
csv2ofx model input.csv output.ofx
```

### Examples

1. Convert a CSV file using the default model:

```sh
csv2ofx default transactions.csv output.ofx
```

2. Convert a CSV file using a specific model:

```sh
csv2ofx bank-export bank_data.csv output.ofx
```

3. Convert a CSV file and filter by date:

```sh
csv2ofx default transactions.csv output.ofx --fromDate 2024-01-01
```

4. Convert a CSV file and filter by account:

```sh
csv2ofx default transactions.csv output.ofx --account savings
```

## CSV Format

The CSV file should contain the following columns (order can be configured):

1. Date (in the format specified in the configuration)
2. Payee
3. Category
4. Amount (positive for credits, negative for debits)
5. Optional: Memo
6. Optional: Labels (comma-separated)
7. Optional: Reference
8. Optional: Account

Example CSV:

```csv
date,payee,category,amount,memo,label,reference,account
2024-01-01,Supermarket,Groceries,-50.00,Weekly shopping,food,REF123,checking
2024-01-02,Salary,Income,2000.00,January salary,income,REF124,checking
```

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
