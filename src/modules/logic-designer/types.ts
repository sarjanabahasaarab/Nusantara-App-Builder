/**
 * Nusantara App Builder - App Logic, Events, Database & API Types
 * Phase 6: Formal schema specification for Events, Actions, SQLite, REST API, Variables, and Logic Flow.
 */

import { VisualScreen } from '../../types/visualDesigner';

export type VariableType =
  | 'string'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'list'
  | 'object';

export type VariableScope =
  | 'local'       // Available only inside the specific event/action chain
  | 'screen'      // Retained while the current screen/activity is active
  | 'app'         // Retained in memory while the application is running
  | 'persistent'; // Persisted to device storage (SharedPreferences / SQLite)

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: any;
  scope: VariableScope;
  description?: string;
  isSensitive?: boolean; // Warns against persistent storage without encryption
}

export type EventTriggerType =
  // Button
  | 'onClick'
  | 'onLongPress'
  // Text Input
  | 'onChange'
  | 'onFocus'
  | 'onBlur'
  // Checkbox / Switch
  | 'onCheckedChange'
  // Screen Lifecycle
  | 'onCreate'
  | 'onResume'
  | 'onPause'
  // WebView
  | 'onPageStarted'
  | 'onPageFinished';

export type ActionCategory =
  | 'navigation'
  | 'ui'
  | 'data'
  | 'database'
  | 'network'
  | 'logic'
  | 'utility';

export type ActionType =
  // Navigation
  | 'navigate_to_screen'
  | 'go_back'
  | 'open_url'
  // UI
  | 'show_message'
  | 'ui_show_message'
  | 'show_dialog'
  | 'show_loading'
  | 'hide_loading'
  | 'set_text'
  | 'set_visibility'
  // Data
  | 'set_variable'
  | 'get_variable'
  | 'save_local_data'
  | 'read_local_data'
  | 'delete_local_data'
  // Database (SQLite)
  | 'db_insert'
  | 'db_update'
  | 'db_delete'
  | 'db_query'
  | 'db_count'
  // Network (REST API)
  | 'http_get'
  | 'http_post'
  | 'http_put'
  | 'http_patch'
  | 'http_delete'
  // Logic
  | 'if_condition'
  | 'switch'
  | 'loop_for_each'
  | 'validate_form'
  // Utility
  | 'delay'
  | 'open_browser'
  | 'share_text'
  | 'copy_text';

export interface LogicAction {
  id: string;
  type: ActionType;
  parameters: Record<string, any>;
  
  // Asynchronous or State Branching (Network & Database)
  onSuccess?: LogicAction[];
  onError?: LogicAction[];
  onLoading?: LogicAction[];

  // Conditional Branching (If / Else If / Else)
  conditionExpression?: string;
  thenBranch?: LogicAction[];
  elseBranch?: LogicAction[];

  // Iteration (Loop For-Each)
  loopItemVariable?: string;
  loopCollectionExpression?: string;
  loopBody?: LogicAction[];

  description?: string;
}

export interface LogicEvent {
  id: string;
  screenId: string;
  componentId: string; // e.g. "button_login", or "screen_root"
  componentName?: string;
  eventType: EventTriggerType;
  actions: LogicAction[];
  description?: string;
  enabled: boolean;
}

// ----------------------------------------------------------------------
// FORM BUILDER & VALIDATION
// ----------------------------------------------------------------------

export interface FormFieldRule {
  required?: boolean;
  requiredMessage?: string;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  min?: number;
  max?: number;
  regexPattern?: string;
}

export interface FormFieldConfig {
  componentId: string;
  fieldName: string;
  rules: FormFieldRule;
  errorMessageTargetId?: string; // Component ID to display inline error
}

export interface FormConfig {
  id: string;
  name: string;
  screenId: string;
  fields: FormFieldConfig[];
  submitButtonComponentId?: string;
}

// ----------------------------------------------------------------------
// SQLITE DATABASE SCHEMAS & QUERY BUILDER
// ----------------------------------------------------------------------

export type SqliteColumnType = 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB';

export interface DatabaseColumn {
  id: string;
  name: string;
  type: SqliteColumnType;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
  isUnique: boolean;
  isNullable: boolean;
  defaultValue?: string;
}

export interface DatabaseTable {
  id: string;
  name: string;
  description?: string;
  columns: DatabaseColumn[];
}

export interface DatabaseSchema {
  id: string;
  name: string; // e.g. "app_database.db"
  version: number;
  tables: DatabaseTable[];
}

export type QueryOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'COUNT';

export interface QueryCondition {
  id?: string;
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  valueExpression: string; // Can be a variable or literal
}

export interface SqlQueryConfig {
  id?: string;
  table: string;
  operation: QueryOperation;
  selectedColumns?: string[];
  values?: Record<string, string>; // column -> expression
  conditions?: QueryCondition[];
  orderByColumn?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit?: number;
}

// ----------------------------------------------------------------------
// REST API & JSON MAPPING
// ----------------------------------------------------------------------

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiAuthType = 'none' | 'api_key' | 'bearer' | 'basic';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  bodyType?: 'none' | 'json' | 'form-data' | 'raw';
  bodyContent?: string;
  timeoutMs: number;
  authType: ApiAuthType;
  authConfig: {
    keyName?: string;
    keyValue?: string;
    addTo?: 'header' | 'query';
    token?: string;
    username?: string;
    password?: string;
  };
  responseType: 'json' | 'text';
  responseMapping?: {
    jsonPath: string; // e.g. "data[]" or "data.user.name"
    targetVariableId?: string;
    targetComponentId?: string;
  }[];
}

export interface ApiTestExecutionResult {
  timestamp: string;
  statusCode: number;
  statusText: string;
  responseTimeMs: number;
  headers: Record<string, string>;
  data: any;
  error?: string;
  isSuccess: boolean;
}

// ----------------------------------------------------------------------
// DATA BINDING
// ----------------------------------------------------------------------

export type BindingSourceType = 'variable' | 'api_response' | 'database_query' | 'static';

export interface DataBinding {
  id: string;
  screenId: string;
  componentId: string;
  targetProperty: 'text' | 'visibility' | 'imageSrc' | 'isChecked' | 'items';
  sourceType: BindingSourceType;
  sourcePath: string; // e.g. "totalHarga", "api_products.data[]", "db_users.name"
  formatTemplate?: string; // e.g. "Rp {{value}}" or "Halo, {{value}}!"
}

// ----------------------------------------------------------------------
// NAVIGATION CONFIG & MAP
// ----------------------------------------------------------------------

export interface NavigationRoute {
  id: string;
  fromScreenId: string;
  toScreenId: string;
  triggerEventId?: string;
  clearBackStack: boolean;
  transitionAnimation?: 'default' | 'slide_in_right' | 'fade_in' | 'none';
}

export interface NavigationConfig {
  startScreenId: string;
  routes: NavigationRoute[];
}

// ----------------------------------------------------------------------
// UNIFIED PROJECT DATA MODEL V2 (MIGRATION COMPATIBLE)
// ----------------------------------------------------------------------

export interface ProjectDataModelV2 {
  schemaVersion: 2;
  formatVersion: '6.0';
  project: {
    id: string;
    name: string;
    packageId: string;
  };
  screens: VisualScreen[];
  events: LogicEvent[];
  variables: Variable[];
  navigation: NavigationConfig;
  databases: DatabaseSchema[];
  apiEndpoints: ApiEndpoint[];
  forms: FormConfig[];
  bindings: DataBinding[];
  createdAt: string;
  updatedAt: string;
}
