/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        ALTER TABLE items ADD COLUMN 
            created_at timestamptz NOT NULL DEFAULT NOW();
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
