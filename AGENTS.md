# AGENTS.md

This document provides a comprehensive overview of the `csv2ofx` project, intended to guide AI coding agents (Claude Code, OpenCode, Cursor, etc.) in understanding the codebase and contributing effectively.

## Project Overview

`csv2ofx` is a Node.js CLI tool written in TypeScript that converts CSV files (financial data) into OFX format (for accounting software like GnuCash) or PortfolioPerformance-compatible CSV.

### Key Features
- CSV to OFX conversion.
- CSV to PortfolioPerformance CSV conversion (`--format csv`).
- Configurable parsing models for different CSV structures.
- Filtering by account and date range.

## Tech Stack

- **Runtime**: Node.js (v22+)
- **Language**: TypeScript (Strict mode)
- **Package Manager**: Yarn
- **Linting**: ESLint + Prettier
- **Date Handling**: Luxon
- **CSV Parsing**: `csv-parse`
- **Configuration**: `node-config`

## Project Structure

```
.
├── config/             # Configuration files (JSON)
│   ├── default.json    # Default models and accounts
│   └── local.json      # Local overrides (git-ignored usually)
├── src/
│   ├── index.ts        # CLI entry point and main App logic
│   ├── config.ts       # Configuration path initialization
│   ├── classes/
│   │   ├── ConfigManager.ts  # Configuration accessor/caching
│   │   ├── Columns.ts        # Column mapping interface
│   │   ├── CsvParser.ts      # CSV parsing logic
│   │   ├── CsvGenerator.ts   # PortfolioPerformance CSV generation
│   │   ├── OfxGenerator.ts   # OFX file generation
│   │   └── Statement.ts      # Data models (Statement, StatementType)
│   └── utils/
│       ├── hashUtils.ts      # SHA-256 hashing for references
│       └── stringUtils.ts    # String formatting (XML escaping, etc.)
├── dist/               # Compiled JS output
├── package.json
├── tsconfig.json
└── eslint.config.mjs
```

## Development Workflow

### Setup
```bash
yarn install
```

### Scripts
- `yarn build`: Compile TypeScript to `dist/`.
- `yarn dev`: Run with hot-reload (ts-node-dev).
- `yarn lint`: Run Prettier and ESLint checks.
- `yarn type-check`: Run TypeScript compiler checks without emitting.
- `yarn test`: Run quality checks (lint + type-check).
- `yarn qc`: Alias for `yarn lint && yarn type-check`.

### Code Style & Conventions
- **Formatting**: 120 chars width, 2-space indent, double quotes, trailing commas (Prettier).
- **Naming**:
    - Classes: PascalCase (`ConfigManager`, `CsvParser`).
    - Interfaces: PascalCase (`Columns`, `Statement`).
    - Variables/Functions: camelCase (`getModelDateFormat`, `parseCsv`).
    - Constants: PascalCase for enums/const objects (`StatementType`).
- **TypeScript Strictness**:
    - `strict: true` in tsconfig.
    - ESLint enforces explicit return types (`@typescript-eslint/explicit-function-return-type`).
    - Unused variables are errors (prefixed with `_` to ignore).
    - `any` is allowed but discouraged where types can be inferred or defined.

### Testing
There are currently **no unit tests** (no test framework like Jest/Vitest is installed). The `yarn test` script runs linting and type-checking. CI (`qc-test.yml`) mirrors this.

## Architecture & Key Components

### Configuration System
- Uses `node-config`.
- Paths: `config/` directory in project root.
- `ConfigManager` class wraps `node-config` with caching.

### Data Flow
1.  **CLI Parsing**: `index.ts` parses args (manual implementation, no external lib like Commander).
2.  **Config Loading**: `ConfigManager` retrieves column mappings and settings.
3.  **CSV Parsing**: `CsvParser` reads file line-by-line using `csv-parse`, mapping columns to a `Statement` object.
    - Handles custom delimiters, encodings, and date formats.
    - Uses `hashUtils` to generate unique references if missing.
4.  **Generation**:
    - `OfxGenerator`: Builds OFX XML structure.
    - `CsvGenerator`: Builds PortfolioPerformance CSV string.

### Configuration Models
- Defined in `config/default.json`.
- `models`: Define how to parse CSVs (delimiter, columns, date format).
- `accounts`: Map account names to bank details and models.

## Important Notes for Agents

- **Entry Point**: `src/index.ts` is the main file.
- **Compilation**: Code must pass strict type checking. Ensure all functions have explicit return types.
- **Environment**: `node-config` relies on `NODE_CONFIG_DIR` set in `src/config.ts`.
- **New Features**: If adding new CSV columns, update `Columns.ts` interface and `Statement.ts` interface, then update `CsvParser.ts` and generators.
- **Dependencies**: Avoid adding heavy dependencies. The project aims to be lightweight.

## Workflow for Making Changes

1.  **Read the Requirement**: Understand the CSV format or feature request.
2.  **Identify Affected Files**: Usually involves `config/`, `Statement.ts`, `Columns.ts`, `CsvParser.ts`, and one of the Generators.
3.  **Implement**:
    - Update interfaces (`Columns`, `Statement`) if data structure changes.
    - Update `CsvParser` to extract new fields.
    - Update Generators to output new fields.
4.  **Verify**:
    - Run `yarn type-check`.
    - Run `yarn lint`.
    - (Optional) Run `yarn dev` with a sample CSV to verify output.
