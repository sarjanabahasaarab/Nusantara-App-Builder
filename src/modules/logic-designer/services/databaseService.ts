/**
 * Nusantara App Builder - SQLite Database Service, Query Builder & CRUD Generator
 * Phase 6: Safe SQL generation, parameterized queries, and automatic CRUD screen generator.
 */

import {
  DatabaseSchema,
  DatabaseTable,
  DatabaseColumn,
  SqlQueryConfig,
  SqliteColumnType,
} from '../types';
import { VisualScreen, VisualComponent } from '../../../types/visualDesigner';

export interface SqlGenerationResult {
  sql: string;
  parameters: string[];
}

export class DatabaseService {
  /**
   * Generates safe CREATE TABLE IF NOT EXISTS DDL statement for SQLite
   */
  public static generateCreateTableSql(table: DatabaseTable): string {
    const colDefs: string[] = [];

    for (const col of table.columns) {
      let def = `    ${col.name} ${col.type}`;

      if (col.isPrimaryKey) {
        def += ' PRIMARY KEY';
        if (col.isAutoIncrement && col.type === 'INTEGER') {
          def += ' AUTOINCREMENT';
        }
      }

      if (!col.isNullable && !col.isPrimaryKey) {
        def += ' NOT NULL';
      }

      if (col.isUnique && !col.isPrimaryKey) {
        def += ' UNIQUE';
      }

      if (col.defaultValue !== undefined && col.defaultValue !== '') {
        if (col.type === 'TEXT') {
          def += ` DEFAULT '${col.defaultValue.replace(/'/g, "''")}'`;
        } else {
          def += ` DEFAULT ${col.defaultValue}`;
        }
      }

      colDefs.push(def);
    }

    return `CREATE TABLE IF NOT EXISTS ${table.name} (\n${colDefs.join(',\n')}\n);`;
  }

  /**
   * Generates parameterized query with safe placeholder (?) to prevent SQL injection
   */
  public static generateParameterizedQuery(config: SqlQueryConfig): SqlGenerationResult {
    const params: string[] = [];
    let sql = '';

    switch (config.operation) {
      case 'SELECT': {
        const cols = config.selectedColumns && config.selectedColumns.length > 0
          ? config.selectedColumns.join(', ')
          : '*';
        sql = `SELECT ${cols} FROM ${config.table}`;
        break;
      }
      case 'COUNT': {
        sql = `SELECT COUNT(*) AS total FROM ${config.table}`;
        break;
      }
      case 'INSERT': {
        const entries = Object.entries(config.values || {});
        if (entries.length === 0) {
          throw new Error('INSERT operation requires at least one column value.');
        }
        const colNames = entries.map(([c]) => c).join(', ');
        const placeholders = entries.map(() => '?').join(', ');
        sql = `INSERT INTO ${config.table} (${colNames}) VALUES (${placeholders})`;
        for (const [, val] of entries) {
          params.push(val);
        }
        return { sql, parameters: params };
      }
      case 'UPDATE': {
        const entries = Object.entries(config.values || {});
        if (entries.length === 0) {
          throw new Error('UPDATE operation requires at least one column value to set.');
        }
        const setClauses = entries.map(([c]) => `${c} = ?`).join(', ');
        sql = `UPDATE ${config.table} SET ${setClauses}`;
        for (const [, val] of entries) {
          params.push(val);
        }
        break;
      }
      case 'DELETE': {
        sql = `DELETE FROM ${config.table}`;
        break;
      }
    }

    // WHERE clause with parameterized values
    if (config.conditions && config.conditions.length > 0) {
      const whereParts: string[] = [];
      for (const cond of config.conditions) {
        whereParts.push(`${cond.column} ${cond.operator} ?`);
        params.push(cond.valueExpression);
      }
      sql += ` WHERE ${whereParts.join(' AND ')}`;
    }

    // ORDER BY
    if (config.orderByColumn && (config.operation === 'SELECT' || config.operation === 'COUNT')) {
      const dir = config.orderDirection === 'DESC' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${config.orderByColumn} ${dir}`;
    }

    // LIMIT
    if (config.limit && config.limit > 0 && config.operation === 'SELECT') {
      sql += ` LIMIT ${config.limit}`;
    }

    return { sql, parameters: params };
  }

  /**
   * Generates a default SQLite schema with sample table for quick startup
   */
  public static createDefaultSchema(): DatabaseSchema {
    return {
      id: 'db_app_main',
      name: 'app_database.db',
      version: 1,
      tables: [
        {
          id: 'table_products',
          name: 'products',
          description: 'Daftar produk dan katalog barang',
          columns: [
            {
              id: 'col_id',
              name: 'id',
              type: 'INTEGER',
              isPrimaryKey: true,
              isAutoIncrement: true,
              isUnique: true,
              isNullable: false,
            },
            {
              id: 'col_name',
              name: 'name',
              type: 'TEXT',
              isPrimaryKey: false,
              isAutoIncrement: false,
              isUnique: false,
              isNullable: false,
            },
            {
              id: 'col_price',
              name: 'price',
              type: 'REAL',
              isPrimaryKey: false,
              isAutoIncrement: false,
              isUnique: false,
              isNullable: false,
              defaultValue: '0.0',
            },
            {
              id: 'col_stock',
              name: 'stock',
              type: 'INTEGER',
              isPrimaryKey: false,
              isAutoIncrement: false,
              isUnique: false,
              isNullable: false,
              defaultValue: '0',
            },
            {
              id: 'col_created_at',
              name: 'created_at',
              type: 'TEXT',
              isPrimaryKey: false,
              isAutoIncrement: false,
              isUnique: false,
              isNullable: true,
            },
          ],
        },
      ],
    };
  }

  /**
   * Automatically generates 4 full VisualScreens for CRUD operations of a table:
   * 1. List Screen
   * 2. Add Screen
   * 3. Edit Screen
   * 4. Detail Screen
   */
  public static generateCrudScreens(table: DatabaseTable): VisualScreen[] {
    const screens: VisualScreen[] = [];
    const entityTitle = table.name.charAt(0).toUpperCase() + table.name.slice(1);

    // 1. LIST SCREEN
    const listScreenId = `screen_${table.name}_list`;
    const listChildren: VisualComponent[] = [
      {
        id: `heading_${table.name}_list`,
        type: 'heading',
        name: `Judul ${entityTitle}`,
        properties: {
          id: `heading_${table.name}_list`,
          name: `Judul ${entityTitle}`,
          width: 'match_parent',
          height: 'wrap_content',
          text: `Daftar ${entityTitle}`,
          textSize: 22,
          textStyle: 'bold',
          textColor: '#F8FAFC',
          marginBottom: 16,
        },
      },
      {
        id: `btn_add_${table.name}`,
        type: 'button',
        name: `Tombol Tambah ${entityTitle}`,
        properties: {
          id: `btn_add_${table.name}`,
          name: `Tambah ${entityTitle}`,
          width: 'match_parent',
          height: 'wrap_content',
          text: `+ Tambah ${entityTitle} Baru`,
          buttonBackgroundColor: '#2563EB',
          buttonTextColor: '#FFFFFF',
          cornerRadius: 8,
          marginBottom: 16,
        },
      },
      {
        id: `card_${table.name}_item_sample`,
        type: 'card',
        name: `Item Card ${entityTitle}`,
        properties: {
          id: `card_${table.name}_item_sample`,
          name: `Item Card ${entityTitle}`,
          width: 'match_parent',
          height: 'wrap_content',
          backgroundColor: '#1E293B',
          cardCornerRadius: 10,
          elevation: 2,
          paddingTop: 12,
          paddingBottom: 12,
          paddingStart: 16,
          paddingEnd: 16,
          marginBottom: 8,
        },
        children: [
          {
            id: `text_${table.name}_title_sample`,
            type: 'text',
            name: `Contoh Nama ${entityTitle}`,
            properties: {
              id: `text_${table.name}_title_sample`,
              name: `Judul Item`,
              width: 'match_parent',
              height: 'wrap_content',
              text: `${entityTitle} #1`,
              textSize: 16,
              textStyle: 'bold',
              textColor: '#38BDF8',
            },
          },
          {
            id: `text_${table.name}_subtitle_sample`,
            type: 'text',
            name: `Sub Info Item`,
            properties: {
              id: `text_${table.name}_subtitle_sample`,
              name: `Sub Info`,
              width: 'match_parent',
              height: 'wrap_content',
              text: `Data dari SQLite table: ${table.name}`,
              textSize: 13,
              textColor: '#94A3B8',
              marginTop: 4,
            },
          },
        ],
      },
    ];

    screens.push({
      id: listScreenId,
      name: `${entityTitle} List`,
      layoutFileName: `activity_${table.name}_list.xml`,
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: `root_${listScreenId}`,
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: `root_${listScreenId}`,
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 16,
          paddingBottom: 16,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: '#0F172A',
        },
        children: listChildren,
      },
    });

    // 2. ADD FORM SCREEN
    const addScreenId = `screen_${table.name}_add`;
    const addFormChildren: VisualComponent[] = [
      {
        id: `heading_${table.name}_add`,
        type: 'heading',
        name: `Tambah ${entityTitle}`,
        properties: {
          id: `heading_${table.name}_add`,
          name: `Tambah ${entityTitle}`,
          width: 'match_parent',
          height: 'wrap_content',
          text: `Tambah ${entityTitle}`,
          textSize: 20,
          textStyle: 'bold',
          textColor: '#F8FAFC',
          marginBottom: 16,
        },
      },
    ];

    // Create inputs for non-autoIncrement columns
    for (const col of table.columns) {
      if (col.isPrimaryKey && col.isAutoIncrement) continue;

      addFormChildren.push({
        id: `label_${table.name}_${col.name}`,
        type: 'label',
        name: `Label ${col.name}`,
        properties: {
          id: `label_${table.name}_${col.name}`,
          name: `Label ${col.name}`,
          width: 'match_parent',
          height: 'wrap_content',
          text: col.name.toUpperCase(),
          textSize: 12,
          textColor: '#94A3B8',
          marginTop: 8,
          marginBottom: 4,
        },
      });

      addFormChildren.push({
        id: `input_${table.name}_${col.name}`,
        type: col.type === 'INTEGER' || col.type === 'REAL' ? 'textField' : 'textField',
        name: `Input ${col.name}`,
        properties: {
          id: `input_${table.name}_${col.name}`,
          name: `Input ${col.name}`,
          width: 'match_parent',
          height: 'wrap_content',
          hint: `Masukkan ${col.name}...`,
          inputType: col.type === 'INTEGER' || col.type === 'REAL' ? 'number' : 'text',
          backgroundColor: '#1E293B',
          textColor: '#F8FAFC',
          marginBottom: 12,
        },
      });
    }

    addFormChildren.push({
      id: `btn_save_${table.name}`,
      type: 'button',
      name: `Simpan Data`,
      properties: {
        id: `btn_save_${table.name}`,
        name: `Simpan Data`,
        width: 'match_parent',
        height: 'wrap_content',
        text: 'Simpan ke Database SQLite',
        buttonBackgroundColor: '#10B981',
        buttonTextColor: '#FFFFFF',
        cornerRadius: 8,
        marginTop: 16,
      },
    });

    screens.push({
      id: addScreenId,
      name: `Add ${entityTitle}`,
      layoutFileName: `activity_${table.name}_add.xml`,
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: `root_${addScreenId}`,
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: `root_${addScreenId}`,
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 16,
          paddingBottom: 16,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: '#0F172A',
        },
        children: addFormChildren,
      },
    });

    // 3. EDIT SCREEN
    const editScreenId = `screen_${table.name}_edit`;
    screens.push({
      id: editScreenId,
      name: `Edit ${entityTitle}`,
      layoutFileName: `activity_${table.name}_edit.xml`,
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: `root_${editScreenId}`,
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: `root_${editScreenId}`,
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 16,
          paddingBottom: 16,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: '#0F172A',
        },
        children: [
          {
            id: `heading_${table.name}_edit`,
            type: 'heading',
            name: `Edit ${entityTitle}`,
            properties: {
              id: `heading_${table.name}_edit`,
              name: `Edit ${entityTitle}`,
              width: 'match_parent',
              height: 'wrap_content',
              text: `Ubah ${entityTitle}`,
              textSize: 20,
              textStyle: 'bold',
              textColor: '#F8FAFC',
              marginBottom: 16,
            },
          },
          {
            id: `btn_update_${table.name}`,
            type: 'button',
            name: `Perbarui Data`,
            properties: {
              id: `btn_update_${table.name}`,
              name: `Perbarui Data`,
              width: 'match_parent',
              height: 'wrap_content',
              text: 'Simpan Perubahan',
              buttonBackgroundColor: '#2563EB',
              buttonTextColor: '#FFFFFF',
              cornerRadius: 8,
              marginTop: 16,
            },
          },
        ],
      },
    });

    // 4. DETAIL SCREEN
    const detailScreenId = `screen_${table.name}_detail`;
    screens.push({
      id: detailScreenId,
      name: `${entityTitle} Detail`,
      layoutFileName: `activity_${table.name}_detail.xml`,
      orientation: 'portrait',
      devicePreset: 'pixel_7',
      backgroundColor: '#0F172A',
      root: {
        id: `root_${detailScreenId}`,
        type: 'verticalLayout',
        name: 'Root Layout',
        properties: {
          id: `root_${detailScreenId}`,
          name: 'Root Layout',
          width: 'match_parent',
          height: 'match_parent',
          orientation: 'vertical',
          paddingTop: 16,
          paddingBottom: 16,
          paddingStart: 16,
          paddingEnd: 16,
          backgroundColor: '#0F172A',
        },
        children: [
          {
            id: `heading_${table.name}_detail`,
            type: 'heading',
            name: `Detail ${entityTitle}`,
            properties: {
              id: `heading_${table.name}_detail`,
              name: `Detail ${entityTitle}`,
              width: 'match_parent',
              height: 'wrap_content',
              text: `Detail ${entityTitle}`,
              textSize: 20,
              textStyle: 'bold',
              textColor: '#F8FAFC',
              marginBottom: 16,
            },
          },
          {
            id: `btn_delete_${table.name}`,
            type: 'button',
            name: `Hapus Data`,
            properties: {
              id: `btn_delete_${table.name}`,
              name: `Hapus Data`,
              width: 'match_parent',
              height: 'wrap_content',
              text: 'Hapus Item Ini',
              buttonBackgroundColor: '#DC2626',
              buttonTextColor: '#FFFFFF',
              cornerRadius: 8,
              marginTop: 24,
            },
          },
        ],
      },
    });

    return screens;
  }
}
