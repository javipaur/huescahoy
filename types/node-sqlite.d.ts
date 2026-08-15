declare module "node:sqlite" {
  export interface StatementSync {
    run(...anonymousParameters: (string | number | bigint | null | undefined)[]): {
      lastInsertRowid: number | bigint;
      changes: number | bigint;
    };
    get(...anonymousParameters: (string | number | bigint | null | undefined)[]): unknown;
    all(...anonymousParameters: (string | number | bigint | null | undefined)[]): unknown[];
  }

  export interface DatabaseSyncOptions {
    open?: boolean;
    readOnly?: boolean;
    enableForeignKeyConstraints?: boolean;
  }

  export class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
