/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        CREATE extension IF NOT EXISTS "uuid-ossp" SCHEMA "public";

        CREATE TABLE IF NOT EXISTS users (
            id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY
        );

        CREATE TABLE IF NOT EXISTS base_items (
            id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY, 
            description text NOT NULL 
        );

        CREATE TABLE IF NOT EXISTS items (
            id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY, 
            base_item_id uuid NOT NULL REFERENCES base_items (id)
        );

        CREATE TABLE IF NOT EXISTS transfers (
            id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
            timestamp timestamptz NOT NULL DEFAULT NOW(), 
            owner_id uuid NOT NULL REFERENCES users (id), 
            item_id uuid NOT NULL REFERENCES items (id)
        ); 
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
        DROP TABLE IF EXISTS transfers; 
        DROP TABLE IF EXISTS items; 
        DROP TABLE IF EXISTS items; 
        DROP TABLE IF EXISTS users;
    `);
}
