# csv2ofx

## Overview

`csv2ofx` is a tool that converts CSV files to OFX format. This is useful for importing financial data into accounting software that supports `OFX` files, like `GnuCash`.

## Features

- Convert CSV files to OFX format
- Support for multiple CSV formats
- Easy to configure using config files

## Installation

To install `csv2ofx`, you can use check it out from GitHub:

```sh
gsh clone rylorin/csv2ofx
yarn build
```

## Configuration

`csv2ofx` supports configuration through a configuration file. The configuration file should be in JSON format and can include the following options:

- `delimiter`: The delimiter used in the CSV file (default is `,`).
- `date_format`: The date format used in the CSV file (default is `%Y-%m-%d`).
- `account_type`: The type of account (e.g., `CHECKING`, `SAVINGS`, `CREDITLINE`).

Example configuration file (`default.json`):

## Usage

To convert a CSV file to OFX, use the following command:

```sh
csv2ofx model input.csv output.ofx
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
