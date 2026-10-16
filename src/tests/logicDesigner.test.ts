/**
 * Nusantara App Builder - Phase 6 Test Suite
 * App Logic, Events, Variables, Expression Parser, Database & REST API Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SafeExpressionEngine } from '../modules/logic-designer/services/expressionEngine';
import { DatabaseService } from '../modules/logic-designer/services/databaseService';
import { ApiService } from '../modules/logic-designer/services/apiService';
import { KotlinLogicGenerator } from '../modules/logic-designer/services/kotlinLogicGenerator';
import { useLogicStore } from '../modules/logic-designer/store/logicStore';
import { DatabaseTable, ProjectDataModelV2 } from '../modules/logic-designer/types';

describe('SafeExpressionEngine', () => {
  it('validates correct expressions with comparisons and logical operators', () => {
    expect(SafeExpressionEngine.validate('username != ""').isValid).toBe(true);
    expect(SafeExpressionEngine.validate('totalHarga > 100000').isValid).toBe(true);
    expect(SafeExpressionEngine.validate('isLoggedIn == true').isValid).toBe(true);
    expect(SafeExpressionEngine.validate('score >= 80 && attendance >= 75').isValid).toBe(true);
    expect(SafeExpressionEngine.validate('!hasError || retryCount < 3').isValid).toBe(true);
    expect(SafeExpressionEngine.validate('user.age >= 18').isValid).toBe(true);
  });

  it('rejects malformed syntax cleanly without throwing or crashing', () => {
    expect(SafeExpressionEngine.validate('totalHarga > > 100').isValid).toBe(false);
    expect(SafeExpressionEngine.validate('&& error').isValid).toBe(false);
    expect(SafeExpressionEngine.validate('(unclosed + 2').isValid).toBe(false);
  });

  it('safely evaluates expressions against a variable dictionary', () => {
    const scope = {
      username: 'budi',
      totalHarga: 150000,
      isLoggedIn: true,
      hasCoupon: false,
      user: {
        role: 'admin',
        level: 5,
      },
    };

    const ast1 = SafeExpressionEngine.parse('username != ""');
    expect(SafeExpressionEngine.evaluate(ast1, scope)).toBe(true);

    const ast2 = SafeExpressionEngine.parse('totalHarga > 100000');
    expect(SafeExpressionEngine.evaluate(ast2, scope)).toBe(true);

    const ast3 = SafeExpressionEngine.parse('isLoggedIn == true && !hasCoupon');
    expect(SafeExpressionEngine.evaluate(ast3, scope)).toBe(true);

    const ast4 = SafeExpressionEngine.parse('user.role == "admin"');
    expect(SafeExpressionEngine.evaluate(ast4, scope)).toBe(true);

    const ast5 = SafeExpressionEngine.parse('user.level < 3');
    expect(SafeExpressionEngine.evaluate(ast5, scope)).toBe(false);
  });

  it('does not allow arbitrary code execution or eval', () => {
    // Attempting function call syntax should fail parse
    expect(SafeExpressionEngine.validate('alert("xss")').isValid).toBe(false);
    expect(SafeExpressionEngine.validate('console.log(1)').isValid).toBe(false);
    expect(SafeExpressionEngine.validate('process.exit()').isValid).toBe(false);
  });
});

describe('DatabaseService', () => {
  const sampleTable: DatabaseTable = {
    id: 'tbl_products',
    name: 'products',
    columns: [
      { id: 'c1', name: 'id', type: 'INTEGER', isPrimaryKey: true, isAutoIncrement: true, isNullable: false, isUnique: true },
      { id: 'c2', name: 'title', type: 'TEXT', isPrimaryKey: false, isAutoIncrement: false, isNullable: false, isUnique: false },
      { id: 'c3', name: 'price', type: 'REAL', isPrimaryKey: false, isAutoIncrement: false, isNullable: false, isUnique: false, defaultValue: '0.0' },
      { id: 'c4', name: 'sku', type: 'TEXT', isPrimaryKey: false, isAutoIncrement: false, isNullable: true, isUnique: true },
    ],
  };

  it('generates safe CREATE TABLE IF NOT EXISTS DDL statements with constraints', () => {
    const ddl = DatabaseService.generateCreateTableSql(sampleTable);
    expect(ddl).toContain('CREATE TABLE IF NOT EXISTS products (');
    expect(ddl).toContain('id INTEGER PRIMARY KEY AUTOINCREMENT');
    expect(ddl).toContain('title TEXT NOT NULL');
    expect(ddl).toContain('price REAL NOT NULL DEFAULT 0.0');
    expect(ddl).toContain('sku TEXT UNIQUE');
  });

  it('generates parameterized SELECT queries with safe ? placeholders', () => {
    const result = DatabaseService.generateParameterizedQuery({
      table: 'products',
      operation: 'SELECT',
      selectedColumns: ['id', 'title', 'price'],
      conditions: [
        { id: 'c1', column: 'price', operator: '>=', valueExpression: '50000' },
        { id: 'c2', column: 'title', operator: 'LIKE', valueExpression: '%kopi%' },
      ],
      orderByColumn: 'price',
      orderDirection: 'DESC',
      limit: 20,
    });

    expect(result.sql).toBe('SELECT id, title, price FROM products WHERE price >= ? AND title LIKE ? ORDER BY price DESC LIMIT 20');
    expect(result.parameters).toEqual(['50000', '%kopi%']);
  });

  it('generates parameterized INSERT queries with safe ? placeholders', () => {
    const result = DatabaseService.generateParameterizedQuery({
      table: 'products',
      operation: 'INSERT',
      values: {
        title: 'Batik Tulis Nusantara',
        price: '350000',
        sku: 'BTK-001',
      },
    });

    expect(result.sql).toBe('INSERT INTO products (title, price, sku) VALUES (?, ?, ?)');
    expect(result.parameters).toEqual(['Batik Tulis Nusantara', '350000', 'BTK-001']);
  });

  it('generates parameterized UPDATE queries with safe ? placeholders', () => {
    const result = DatabaseService.generateParameterizedQuery({
      table: 'products',
      operation: 'UPDATE',
      values: {
        price: '375000',
      },
      conditions: [{ id: 'c1', column: 'id', operator: '=', valueExpression: '42' }],
    });

    expect(result.sql).toBe('UPDATE products SET price = ? WHERE id = ?');
    expect(result.parameters).toEqual(['375000', '42']);
  });

  it('generates parameterized DELETE queries with safe ? placeholders', () => {
    const result = DatabaseService.generateParameterizedQuery({
      table: 'products',
      operation: 'DELETE',
      conditions: [{ id: 'c1', column: 'id', operator: '=', valueExpression: '42' }],
    });

    expect(result.sql).toBe('DELETE FROM products WHERE id = ?');
    expect(result.parameters).toEqual(['42']);
  });
});

describe('ApiService', () => {
  it('validates HTTP and HTTPS endpoint URLs accurately', () => {
    expect(ApiService.validateEndpointUrl('https://api.example.com/items').isValid).toBe(true);
    expect(ApiService.validateEndpointUrl('http://192.168.1.100:8080/data').isValid).toBe(true);
    expect(ApiService.validateEndpointUrl('api.example.com/v1').isValid).toBe(true);
  });

  it('rejects dangerous and forbidden URL schemes', () => {
    expect(ApiService.validateEndpointUrl('javascript:alert(1)').isValid).toBe(false);
    expect(ApiService.validateEndpointUrl('file:///etc/passwd').isValid).toBe(false);
    expect(ApiService.validateEndpointUrl('data:text/html,<html>').isValid).toBe(false);
    expect(ApiService.validateEndpointUrl('').isValid).toBe(false);
  });
});

describe('KotlinLogicGenerator', () => {
  const dummyModel: ProjectDataModelV2 = {
    schemaVersion: 2,
    formatVersion: '6.0',
    project: {
      id: 'proj_store',
      name: 'Nusantara Store',
      packageId: 'id.nusantara.store',
    },
    screens: [
      { id: 'screen_main', name: 'Main Screen', layoutFileName: 'activity_main' } as any,
    ],
    events: [
      {
        id: 'evt_btn_save',
        screenId: 'screen_main',
        componentId: 'btn_save',
        eventType: 'onClick',
        enabled: true,
        actions: [
          {
            id: 'act_1',
            type: 'ui_show_message',
            parameters: { message: 'Data berhasil disimpan' },
          },
        ],
      },
    ],
    variables: [
      {
        id: 'var_counter',
        name: 'counter',
        type: 'integer',
        defaultValue: 0,
        scope: 'app',
      },
    ],
    databases: [
      {
        id: 'db_local',
        name: 'app_database.db',
        version: 1,
        tables: [
          {
            id: 'tbl_notes',
            name: 'notes',
            columns: [
              { id: 'c1', name: 'id', type: 'INTEGER', isPrimaryKey: true, isAutoIncrement: true, isNullable: false, isUnique: true },
              { id: 'c2', name: 'content', type: 'TEXT', isPrimaryKey: false, isAutoIncrement: false, isNullable: false, isUnique: false },
            ],
          },
        ],
      },
    ],
    apiEndpoints: [
      {
        id: 'api_weather',
        name: 'Get Weather',
        method: 'GET',
        url: 'https://api.weather.com/v1/current',
        headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
        queryParams: [],
        timeoutMs: 5000,
        authType: 'none',
        authConfig: {},
        responseType: 'json',
        responseMapping: [],
      },
    ],
    forms: [],
    navigation: {
      startScreenId: 'screen_main',
      routes: [],
    },
    bindings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('generates production Kotlin companion files without errors', () => {
    const files = KotlinLogicGenerator.generateAllLogicFiles(dummyModel, 'id.nusantara.store');
    expect(files.length).toBeGreaterThanOrEqual(3);

    const dbFile = files.find((f) => f.name === 'DatabaseHelper.kt');
    expect(dbFile).toBeDefined();
    expect(dbFile?.content).toContain('package id.nusantara.store.data');
    expect(dbFile?.content).toContain('class DatabaseHelper');
    expect(dbFile?.content).toContain('SQLiteOpenHelper');
    expect(dbFile?.content).toContain('CREATE TABLE IF NOT EXISTS notes');

    const apiFile = files.find((f) => f.name === 'ApiClient.kt');
    expect(apiFile).toBeDefined();
    expect(apiFile?.content).toContain('package id.nusantara.store.network');
    expect(apiFile?.content).toContain('object ApiClient');
    expect(apiFile?.content).toContain('HttpURLConnection');

    const logicFile = files.find((f) => f.name === 'AppLogicController.kt');
    expect(logicFile).toBeDefined();
    expect(logicFile?.content).toContain('package id.nusantara.store.logic');
    expect(logicFile?.content).toContain('class AppLogicController');
    expect(logicFile?.content).toContain('findViewById<android.view.View?>(R.id.btn_save)?.setOnClickListener');
  });
});

describe('useLogicStore State Management', () => {
  beforeEach(() => {
    // Reset store state
    useLogicStore.setState({
      events: [],
      variables: [],
      undoStack: [],
      redoStack: [],
    });
  });

  it('adds, updates, and deletes variables with respective scopes', () => {
    useLogicStore.getState().addVariable({
      name: 'isUserActive',
      type: 'boolean',
      defaultValue: false,
      scope: 'app',
      description: 'Active status',
    });

    const vars = useLogicStore.getState().variables;
    expect(vars.length).toBe(1);
    expect(vars[0].name).toBe('isUserActive');
    expect(vars[0].scope).toBe('app');

    const varId = vars[0].id;
    useLogicStore.getState().updateVariable(varId, { defaultValue: true });
    expect(useLogicStore.getState().variables[0].defaultValue).toBe(true);

    useLogicStore.getState().deleteVariable(varId);
    expect(useLogicStore.getState().variables.length).toBe(0);
  });

  it('supports undo and redo operations on logic mutations', () => {
    useLogicStore.getState().addVariable({
      name: 'testVar',
      type: 'string',
      defaultValue: 'hello',
      scope: 'local',
    });

    expect(useLogicStore.getState().variables.length).toBe(1);

    // Undo should revert to empty
    useLogicStore.getState().undo();
    expect(useLogicStore.getState().variables.length).toBe(0);

    // Redo should restore the variable
    useLogicStore.getState().redo();
    expect(useLogicStore.getState().variables.length).toBe(1);
    expect(useLogicStore.getState().variables[0].name).toBe('testVar');
  });
});
