/**
 * Nusantara App Builder - Kotlin Logic & Android Code Generator
 * Phase 6: Generates production Kotlin code for SQLite, REST API, Event Handlers, and Navigation.
 */

import {
  LogicEvent,
  LogicAction,
  Variable,
  DatabaseSchema,
  ApiEndpoint,
  FormConfig,
  NavigationConfig,
  ProjectDataModelV2,
} from '../types';
import { ProjectFile } from '../../../types/project';
import { SafeExpressionEngine } from './expressionEngine';

export class KotlinLogicGenerator {
  /**
   * Generates all companion Kotlin files for SQLite, API, and Logic Handlers
   */
  public static generateAllLogicFiles(
    model: ProjectDataModelV2,
    packageId: string
  ): ProjectFile[] {
    const files: ProjectFile[] = [];
    const packagePath = packageId.replace(/\./g, '/');

    // 1. SQLite Database Helper
    if (model.databases && model.databases.length > 0) {
      for (const db of model.databases) {
        files.push({
          path: `app/src/main/java/${packagePath}/data/DatabaseHelper.kt`,
          name: 'DatabaseHelper.kt',
          content: this.generateDatabaseHelperKotlin(db, packageId),
        });
      }
    }

    // 2. REST API Network Client
    if (model.apiEndpoints && model.apiEndpoints.length > 0) {
      files.push({
        path: `app/src/main/java/${packagePath}/network/ApiClient.kt`,
        name: 'ApiClient.kt',
        content: this.generateApiClientKotlin(model.apiEndpoints, packageId),
      });
    }

    // 3. Logic Handlers & State Controller
    files.push({
      path: `app/src/main/java/${packagePath}/logic/AppLogicController.kt`,
      name: 'AppLogicController.kt',
      content: this.generateLogicControllerKotlin(model, packageId),
    });

    return files;
  }

  /**
   * Generates SQLiteOpenHelper Kotlin class with CRUD repositories
   */
  public static generateDatabaseHelperKotlin(db: DatabaseSchema, packageId: string): string {
    const tableCreations = db.tables.map((t) => {
      const colDefs = t.columns.map((c) => {
        let def = `"${c.name} ${c.type}`;
        if (c.isPrimaryKey) {
          def += ' PRIMARY KEY';
          if (c.isAutoIncrement) def += ' AUTOINCREMENT';
        }
        if (!c.isNullable && !c.isPrimaryKey) def += ' NOT NULL';
        if (c.isUnique) def += ' UNIQUE';
        def += '"';
        return def;
      });

      return `        db.execSQL("CREATE TABLE IF NOT EXISTS ${t.name} (" + \n            ${colDefs.join(' + ", " + \n            ')} + ")")`;
    }).join('\n\n');

    const tableUpgrades = db.tables.map((t) => {
      return `        db.execSQL("DROP TABLE IF EXISTS ${t.name}")`;
    }).join('\n');

    // Repositories for each table
    const repositories = db.tables.map((t) => {
      const entityName = t.name.charAt(0).toUpperCase() + t.name.slice(1);
      return `
    // -------------------------------------------------------------------------
    // ${entityName} CRUD Repository
    // -------------------------------------------------------------------------
    fun insert${entityName}(values: android.content.ContentValues): Long {
        val db = writableDatabase
        return db.insert("${t.name}", null, values)
    }

    fun update${entityName}(id: Long, values: android.content.ContentValues): Int {
        val db = writableDatabase
        return db.update("${t.name}", values, "id = ?", arrayOf(id.toString()))
    }

    fun delete${entityName}(id: Long): Int {
        val db = writableDatabase
        return db.delete("${t.name}", "id = ?", arrayOf(id.toString()))
    }

    fun getAll${entityName}(): android.database.Cursor {
        val db = readableDatabase
        return db.rawQuery("SELECT * FROM ${t.name} ORDER BY id DESC", null)
    }
`;
    }).join('\n');

    return `package ${packageId}.data

// NUSANTARA:GENERATED:START:DATABASE
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/**
 * Nusantara App Builder - SQLite Database Engine
 * Auto-generated database helper for ${db.name} (Schema Version ${db.version})
 */
class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "${db.name}"
        const val DATABASE_VERSION = ${db.version}
    }

    override fun onCreate(db: SQLiteDatabase) {
${tableCreations}
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
${tableUpgrades}
        onCreate(db)
    }
${repositories}
}
// NUSANTARA:GENERATED:END:DATABASE
`;
  }

  /**
   * Generates Coroutine-based REST API Client in Kotlin
   */
  public static generateApiClientKotlin(endpoints: ApiEndpoint[], packageId: string): string {
    const endpointMethods = endpoints.map((ep) => {
      const methodName = ep.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return `
    /**
     * ${ep.method} ${ep.url}
     */
    suspend fun ${methodName}(
        headers: Map<String, String> = emptyMap(),
        body: String? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${ep.url}")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "${ep.method}"
            connection.connectTimeout = ${ep.timeoutMs}
            connection.readTimeout = ${ep.timeoutMs}
            connection.setRequestProperty("Accept", "application/json")

            headers.forEach { (k, v) -> connection.setRequestProperty(k, v) }

            if (body != null && ("${ep.method}" == "POST" || "${ep.method}" == "PUT" || "${ep.method}" == "PATCH")) {
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                connection.outputStream.use { os ->
                    os.write(body.toByteArray(Charsets.UTF_8))
                }
            }

            val statusCode = connection.responseCode
            val stream = if (statusCode in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.bufferedReader()?.use { it.readText() } ?: ""

            if (statusCode in 200..299) {
                Result.success(responseText)
            } else {
                Result.failure(Exception("HTTP $statusCode: $responseText"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
`;
    }).join('\n');

    return `package ${packageId}.network

// NUSANTARA:GENERATED:START:NETWORK
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

/**
 * Nusantara App Builder - Native Coroutine API Client
 */
object ApiClient {
${endpointMethods}
}
// NUSANTARA:GENERATED:END:NETWORK
`;
  }

  /**
   * Generates Activity Logic & Event Hookup Controller
   */
  public static generateLogicControllerKotlin(
    model: ProjectDataModelV2,
    packageId: string
  ): string {
    // Generate Variable definitions
    const variableDefs = (model.variables || []).map((v) => {
      const kType =
        v.type === 'integer' ? 'Int' :
        v.type === 'decimal' ? 'Double' :
        v.type === 'boolean' ? 'Boolean' : 'String';
      const kDefault =
        v.type === 'integer' ? `${v.defaultValue || 0}` :
        v.type === 'decimal' ? `${v.defaultValue || 0.0}` :
        v.type === 'boolean' ? `${Boolean(v.defaultValue)}` :
        `"${v.defaultValue || ''}"`;

      return `    var ${v.name}: ${kType} = ${kDefault}`;
    }).join('\n');

    // Generate Event setup statements
    const eventHandlers = (model.events || []).map((evt) => {
      const actionsCode = evt.actions.map((act) => this.generateActionKotlin(act)).join('\n');
      if (evt.eventType === 'onClick') {
        return `
        // Event for component: ${evt.componentId}
        findViewById<android.view.View?>(R.id.${evt.componentId})?.setOnClickListener {
${actionsCode}
        }`;
      } else if (evt.eventType === 'onLongPress') {
        return `
        findViewById<android.view.View?>(R.id.${evt.componentId})?.setOnLongClickListener {
${actionsCode}
            true
        }`;
      }
      return '';
    }).filter(Boolean).join('\n');

    return `package ${packageId}.logic

// NUSANTARA:GENERATED:START:LOGIC
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.*

/**
 * Nusantara App Builder - Application Logic Controller
 */
class AppLogicController(private val activity: AppCompatActivity) {

    private val scope = CoroutineScope(Dispatchers.Main + Job())

    // Application Variables
${variableDefs}

    /**
     * Binds visual components to defined events and actions
     */
    fun setupEventBindings() {
${eventHandlers}
    }

    fun onDestroy() {
        scope.cancel()
    }
}
// NUSANTARA:GENERATED:END:LOGIC
`;
  }

  /**
   * Converts a single LogicAction to Kotlin statements
   */
  private static generateActionKotlin(action: LogicAction): string {
    switch (action.type) {
      case 'navigate_to_screen':
        return `            // Navigate to screen: ${action.parameters.targetScreenId}
            val intent = Intent(activity, ${action.parameters.targetActivityName || 'MainActivity'}::class.java)
            activity.startActivity(intent)`;

      case 'go_back':
        return `            activity.finish()`;

      case 'show_message':
        return `            Toast.makeText(activity, "${action.parameters.message || 'Notification'}", Toast.LENGTH_SHORT).show()`;

      case 'set_text':
        return `            activity.findViewById<android.widget.TextView?>(R.id.${action.parameters.targetComponentId})?.text = "${action.parameters.text || ''}"`;

      case 'set_visibility':
        const vis = action.parameters.visibility === 'gone' ? 'android.view.View.GONE' :
                    action.parameters.visibility === 'invisible' ? 'android.view.View.INVISIBLE' : 'android.view.View.VISIBLE';
        return `            activity.findViewById<android.view.View?>(R.id.${action.parameters.targetComponentId})?.visibility = ${vis}`;

      case 'set_variable':
        return `            ${action.parameters.variableName} = ${action.parameters.valueExpression || '""'}`;

      case 'delay':
        return `            scope.launch { delay(${action.parameters.delayMs || 1000}L) }`;

      case 'validate_form':
        return `            // Form validation
            val isValid = true
            if (!isValid) return@setOnClickListener`;

      default:
        return `            // Action: ${action.type}`;
    }
  }
}
