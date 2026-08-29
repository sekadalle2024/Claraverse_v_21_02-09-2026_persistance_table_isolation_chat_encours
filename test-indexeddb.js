// Script de Tests ClaraVerse IndexedDB
// Tests complets pour vérifier la migration et le fonctionnement

(function () {
  "use strict";

  console.log("🧪 ClaraVerse IndexedDB Test Suite");

  // Configuration des tests
  const TEST_CONFIG = {
    DB_NAME: "claraverse_tables_db",
    DB_VERSION: 1,
    STORE_NAME: "cell_data",
    TEST_PREFIX: "test_",
    DEBUG: true,
    PERFORMANCE_SAMPLES: 100,
  };

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: [],
    startTime: null,
    endTime: null,
    performance: {},
  };

  let db = null;

  // Fonction de log pour les tests
  function testLog(message, type = "info") {
    if (!TEST_CONFIG.DEBUG) return;

    const emoji = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      test: "🧪",
    };

    console.log(`${emoji[type]} [Test] ${message}`);
  }

  // Framework de test simple
  function assert(condition, message) {
    testResults.total++;

    if (condition) {
      testResults.passed++;
      testResults.details.push({
        status: "PASS",
        message: message,
        timestamp: Date.now(),
      });
      testLog(`✅ PASS: ${message}`, "success");
    } else {
      testResults.failed++;
      testResults.details.push({
        status: "FAIL",
        message: message,
        timestamp: Date.now(),
      });
      testLog(`❌ FAIL: ${message}`, "error");
    }
  }

  async function asyncAssert(asyncCondition, message) {
    try {
      const result = await asyncCondition();
      assert(result, message);
    } catch (error) {
      assert(false, `${message} - Error: ${error.message}`);
    }
  }

  // Initialiser IndexedDB pour les tests
  async function initTestDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        TEST_CONFIG.DB_NAME,
        TEST_CONFIG.DB_VERSION,
      );

      request.onerror = (event) => {
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(TEST_CONFIG.STORE_NAME)) {
          const store = database.createObjectStore(TEST_CONFIG.STORE_NAME, {
            keyPath: "cellId",
          });
          store.createIndex("tableId", "tableId", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  // Nettoyer les données de test
  async function cleanupTestData() {
    if (!db) return;

    try {
      const transaction = db.transaction([TEST_CONFIG.STORE_NAME], "readwrite");
      const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const allData = event.target.result;
          const testData = allData.filter((item) =>
            item.cellId.startsWith(TEST_CONFIG.TEST_PREFIX),
          );

          if (testData.length > 0) {
            const deleteTransaction = db.transaction(
              [TEST_CONFIG.STORE_NAME],
              "readwrite",
            );
            const deleteStore = deleteTransaction.objectStore(
              TEST_CONFIG.STORE_NAME,
            );

            testData.forEach((item) => {
              deleteStore.delete(item.cellId);
            });

            deleteTransaction.oncomplete = () => {
              testLog(`Nettoyé ${testData.length} données de test`);
              resolve();
            };
          } else {
            resolve();
          }
        };
      });
    } catch (error) {
      testLog(`Erreur nettoyage: ${error}`, "error");
    }
  }

  // Test 1: Vérification du support IndexedDB
  function testIndexedDBSupport() {
    testLog("Test 1: Support IndexedDB", "test");

    assert(!!window.indexedDB, "IndexedDB disponible dans le navigateur");
    assert(
      typeof indexedDB.open === "function",
      "IndexedDB.open est une fonction",
    );

    if (window.indexedDB) {
      assert(
        typeof indexedDB.deleteDatabase === "function",
        "IndexedDB.deleteDatabase disponible",
      );
    }
  }

  // Test 2: Ouverture et création de base
  async function testDatabaseCreation() {
    testLog("Test 2: Création de base de données", "test");

    try {
      await initTestDB();
      assert(!!db, "Base de données ouverte avec succès");
      assert(db.name === TEST_CONFIG.DB_NAME, "Nom de base correct");
      assert(db.version === TEST_CONFIG.DB_VERSION, "Version de base correcte");
      assert(
        db.objectStoreNames.contains(TEST_CONFIG.STORE_NAME),
        "Object store créé",
      );
    } catch (error) {
      assert(false, `Erreur création base: ${error.message}`);
    }
  }

  // Test 3: Opérations CRUD de base
  async function testCrudOperations() {
    testLog("Test 3: Opérations CRUD", "test");

    const testData = {
      cellId: `${TEST_CONFIG.TEST_PREFIX}crud_test`,
      content: "Test content",
      html: "<p>Test content</p>",
      text: "Test content",
      tableId: "test_table",
      cellIndex: 0,
      timestamp: Date.now(),
    };

    try {
      // CREATE
      const transaction = db.transaction([TEST_CONFIG.STORE_NAME], "readwrite");
      const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);

      await new Promise((resolve, reject) => {
        const request = store.put(testData);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });

      assert(true, "Données insérées avec succès (CREATE)");

      // READ
      const readTransaction = db.transaction(
        [TEST_CONFIG.STORE_NAME],
        "readonly",
      );
      const readStore = readTransaction.objectStore(TEST_CONFIG.STORE_NAME);

      const retrievedData = await new Promise((resolve, reject) => {
        const request = readStore.get(testData.cellId);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });

      assert(!!retrievedData, "Données récupérées avec succès (READ)");
      assert(
        retrievedData.content === testData.content,
        "Contenu correct après lecture",
      );

      // UPDATE
      const updatedData = { ...testData, content: "Updated content" };
      const updateTransaction = db.transaction(
        [TEST_CONFIG.STORE_NAME],
        "readwrite",
      );
      const updateStore = updateTransaction.objectStore(TEST_CONFIG.STORE_NAME);

      await new Promise((resolve, reject) => {
        const request = updateStore.put(updatedData);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });

      assert(true, "Données mises à jour avec succès (UPDATE)");

      // DELETE
      const deleteTransaction = db.transaction(
        [TEST_CONFIG.STORE_NAME],
        "readwrite",
      );
      const deleteStore = deleteTransaction.objectStore(TEST_CONFIG.STORE_NAME);

      await new Promise((resolve, reject) => {
        const request = deleteStore.delete(testData.cellId);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
      });

      assert(true, "Données supprimées avec succès (DELETE)");
    } catch (error) {
      assert(false, `Erreur opérations CRUD: ${error.message}`);
    }
  }

  // Test 4: Performance et capacité
  async function testPerformance() {
    testLog("Test 4: Tests de performance", "test");

    const sampleSize = TEST_CONFIG.PERFORMANCE_SAMPLES;
    const testData = [];

    // Générer données de test
    for (let i = 0; i < sampleSize; i++) {
      testData.push({
        cellId: `${TEST_CONFIG.TEST_PREFIX}perf_${i}`,
        content: `Test content ${i}`.repeat(10), // Contenu plus volumineux
        html: `<p>Test content ${i}</p>`.repeat(10),
        text: `Test content ${i}`.repeat(10),
        tableId: `test_table_${Math.floor(i / 10)}`,
        cellIndex: i % 10,
        timestamp: Date.now() + i,
      });
    }

    try {
      // Test d'écriture en lot
      const writeStartTime = performance.now();

      const transaction = db.transaction([TEST_CONFIG.STORE_NAME], "readwrite");
      const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);

      for (const data of testData) {
        store.put(data);
      }

      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e.target.error);
      });

      const writeTime = performance.now() - writeStartTime;
      testResults.performance.batchWrite = writeTime;

      assert(
        true,
        `Écriture batch: ${sampleSize} entrées en ${writeTime.toFixed(2)}ms`,
      );
      assert(writeTime < 5000, "Performance écriture acceptable (<5s)");

      // Test de lecture en lot
      const readStartTime = performance.now();

      const readTransaction = db.transaction(
        [TEST_CONFIG.STORE_NAME],
        "readonly",
      );
      const readStore = readTransaction.objectStore(TEST_CONFIG.STORE_NAME);

      const allData = await new Promise((resolve, reject) => {
        const request = readStore.getAll();
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });

      const readTime = performance.now() - readStartTime;
      testResults.performance.batchRead = readTime;

      const testDataCount = allData.filter((item) =>
        item.cellId.startsWith(TEST_CONFIG.TEST_PREFIX),
      ).length;
      assert(
        testDataCount >= sampleSize,
        `Toutes les données lues: ${testDataCount}/${sampleSize}`,
      );
      assert(readTime < 1000, "Performance lecture acceptable (<1s)");

      testLog(
        `Lecture batch: ${testDataCount} entrées en ${readTime.toFixed(2)}ms`,
      );
    } catch (error) {
      assert(false, `Erreur test performance: ${error.message}`);
    }
  }

  // Test 5: Index et requêtes
  async function testIndexQueries() {
    testLog("Test 5: Tests d'index et requêtes", "test");

    try {
      const transaction = db.transaction([TEST_CONFIG.STORE_NAME], "readonly");
      const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);

      // Test index tableId
      if (store.indexNames.contains("tableId")) {
        const index = store.index("tableId");

        const indexData = await new Promise((resolve, reject) => {
          const request = index.getAll("test_table_0");
          request.onsuccess = (e) => resolve(e.target.result);
          request.onerror = (e) => reject(e.target.error);
        });

        assert(Array.isArray(indexData), "Index tableId retourne un tableau");
        assert(
          indexData.every((item) => item.tableId === "test_table_0"),
          "Résultats index corrects",
        );

        testLog(`Index tableId: ${indexData.length} résultats`);
      }

      // Test index timestamp
      if (store.indexNames.contains("timestamp")) {
        const timestampIndex = store.index("timestamp");

        const recentData = await new Promise((resolve, reject) => {
          const now = Date.now();
          const request = timestampIndex.getAll(
            IDBKeyRange.lowerBound(now - 60000),
          ); // Dernière minute
          request.onsuccess = (e) => resolve(e.target.result);
          request.onerror = (e) => reject(e.target.error);
        });

        assert(Array.isArray(recentData), "Index timestamp fonctionne");
        testLog(`Index timestamp: ${recentData.length} entrées récentes`);
      }

      assert(true, "Tests d'index réussis");
    } catch (error) {
      assert(false, `Erreur test index: ${error.message}`);
    }
  }

  // Test 6: Gestion des erreurs et récupération
  async function testErrorHandling() {
    testLog("Test 6: Gestion des erreurs", "test");

    try {
      // Test données invalides
      const invalidData = {
        // Pas de cellId (clé primaire manquante)
        content: "Invalid data",
      };

      let errorCaught = false;
      try {
        const transaction = db.transaction(
          [TEST_CONFIG.STORE_NAME],
          "readwrite",
        );
        const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);

        await new Promise((resolve, reject) => {
          const request = store.put(invalidData);
          request.onsuccess = () => resolve();
          request.onerror = (e) => reject(e.target.error);
        });
      } catch (error) {
        errorCaught = true;
      }

      assert(
        errorCaught,
        "Erreur correctement capturée pour données invalides",
      );

      // Test lecture clé inexistante
      const transaction = db.transaction([TEST_CONFIG.STORE_NAME], "readonly");
      const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);

      const nonExistentData = await new Promise((resolve, reject) => {
        const request = store.get("non_existent_key_12345");
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });

      assert(
        nonExistentData === undefined,
        "Clé inexistante retourne undefined",
      );
    } catch (error) {
      assert(false, `Erreur test gestion erreurs: ${error.message}`);
    }
  }

  // Test 7: API ClaraVerse
  async function testClaraVerseAPI() {
    testLog("Test 7: API ClaraVerse", "test");

    // Vérifier que l'API est exposée
    assert(!!window.ClaraVerse, "Objet ClaraVerse disponible");

    if (window.ClaraVerse) {
      assert(
        !!window.ClaraVerse.TablePersistence,
        "API TablePersistence disponible",
      );

      const api = window.ClaraVerse.TablePersistence;

      // Test méthodes principales
      assert(typeof api.scan === "function", "Méthode scan disponible");
      assert(
        typeof api.saveTable === "function",
        "Méthode saveTable disponible",
      );
      assert(
        typeof api.restoreAll === "function",
        "Méthode restoreAll disponible",
      );
      assert(
        typeof api.exportData === "function",
        "Méthode exportData disponible",
      );
      assert(typeof api.debug === "function", "Méthode debug disponible");

      // Test accès IndexedDB
      if (api.db) {
        assert(typeof api.db.save === "function", "Méthode db.save disponible");
        assert(typeof api.db.get === "function", "Méthode db.get disponible");
        assert(
          typeof api.db.getAll === "function",
          "Méthode db.getAll disponible",
        );
      }

      // Test événements
      assert(typeof api.on === "function", "Système d'événements disponible");
      assert(
        typeof api.emit === "function",
        "Émission d'événements disponible",
      );

      // Test état
      assert(
        typeof api.isInitialized === "function",
        "Vérification d'initialisation disponible",
      );
      assert(
        typeof api.getConfig === "function",
        "Accès à la configuration disponible",
      );
    }
  }

  // Test 8: Compatibilité localStorage
  async function testLocalStorageCompatibility() {
    testLog("Test 8: Compatibilité localStorage", "test");

    if (
      window.ClaraVerse &&
      window.ClaraVerse.TablePersistence &&
      window.ClaraVerse.TablePersistence.localStorage
    ) {
      const compatAPI = window.ClaraVerse.TablePersistence.localStorage;

      assert(
        typeof compatAPI.getItem === "function",
        "getItem compatible disponible",
      );
      assert(
        typeof compatAPI.setItem === "function",
        "setItem compatible disponible",
      );
      assert(
        typeof compatAPI.removeItem === "function",
        "removeItem compatible disponible",
      );

      // Test opérations de compatibilité
      try {
        const testKey = `${TEST_CONFIG.TEST_PREFIX}compat_test`;
        const testValue = JSON.stringify({
          test: "localStorage compatibility",
        });

        const setResult = await compatAPI.setItem(testKey, testValue);
        assert(setResult, "setItem compatible fonctionne");

        const getValue = await compatAPI.getItem(testKey);
        assert(getValue === testValue, "getItem compatible fonctionne");

        const removeResult = await compatAPI.removeItem(testKey);
        assert(removeResult, "removeItem compatible fonctionne");
      } catch (error) {
        assert(false, `Erreur compatibilité localStorage: ${error.message}`);
      }
    } else {
      assert(false, "API de compatibilité localStorage non trouvée");
    }
  }

  // Test 9: Migration (si données localStorage présentes)
  async function testMigrationCapabilities() {
    testLog("Test 9: Capacités de migration", "test");

    // Créer des données factices dans localStorage
    const testLocalStorageData = {
      content: "Migration test content",
      text: "Migration test content",
      timestamp: Date.now(),
    };

    const testKey = "claraverse_cell_migration_test";
    localStorage.setItem(testKey, JSON.stringify(testLocalStorageData));

    // Vérifier que l'outil de migration est disponible
    if (window.ClaraVerseMigration) {
      assert(
        typeof window.ClaraVerseMigration.scan === "function",
        "Fonction scan migration disponible",
      );
      assert(
        typeof window.ClaraVerseMigration.backup === "function",
        "Fonction backup migration disponible",
      );

      // Test scan
      const scannedData = window.ClaraVerseMigration.scan();
      assert(Array.isArray(scannedData), "Scan retourne un tableau");

      const testEntry = scannedData.find(
        (item) => item.originalKey === testKey,
      );
      assert(!!testEntry, "Données test trouvées par le scan");

      testLog(`Migration scan: ${scannedData.length} entrées trouvées`);
    } else {
      testLog("Outil de migration non chargé - test ignoré", "warning");
    }

    // Nettoyer
    localStorage.removeItem(testKey);
  }

  // Test 10: Stress test
  async function testStress() {
    testLog("Test 10: Stress test", "test");

    const stressCount = 1000;
    const stressData = [];

    // Générer beaucoup de données
    for (let i = 0; i < stressCount; i++) {
      stressData.push({
        cellId: `${TEST_CONFIG.TEST_PREFIX}stress_${i}`,
        content: `Stress test content ${i}`.repeat(50),
        html: `<div>Stress test ${i}</div>`.repeat(50),
        text: `Stress test ${i}`.repeat(50),
        tableId: `stress_table_${Math.floor(i / 100)}`,
        cellIndex: i,
        timestamp: Date.now() + i,
      });
    }

    try {
      const startTime = performance.now();

      // Écriture massive
      const transaction = db.transaction([TEST_CONFIG.STORE_NAME], "readwrite");
      const store = transaction.objectStore(TEST_CONFIG.STORE_NAME);

      stressData.forEach((data) => store.put(data));

      await new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e.target.error);
      });

      const writeTime = performance.now() - startTime;
      testResults.performance.stressWrite = writeTime;

      assert(
        writeTime < 10000,
        `Stress test écriture réussi: ${stressCount} entrées en ${writeTime.toFixed(2)}ms`,
      );

      // Lecture massive
      const readStartTime = performance.now();
      const readTransaction = db.transaction(
        [TEST_CONFIG.STORE_NAME],
        "readonly",
      );
      const readStore = readTransaction.objectStore(TEST_CONFIG.STORE_NAME);

      const allData = await new Promise((resolve, reject) => {
        const request = readStore.getAll();
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
      });

      const readTime = performance.now() - readStartTime;
      testResults.performance.stressRead = readTime;

      const stressDataCount = allData.filter((item) =>
        item.cellId.startsWith(`${TEST_CONFIG.TEST_PREFIX}stress_`),
      ).length;
      assert(
        stressDataCount === stressCount,
        `Stress test lecture: ${stressDataCount}/${stressCount} entrées`,
      );
    } catch (error) {
      assert(false, `Erreur stress test: ${error.message}`);
    }
  }

  // Exécuter tous les tests
  async function runAllTests() {
    testLog("🚀 Démarrage de la suite de tests", "test");
    testResults.startTime = Date.now();

    try {
      // Tests synchrones
      testIndexedDBSupport();

      // Tests asynchrones
      await testDatabaseCreation();
      await testCrudOperations();
      await testPerformance();
      await testIndexQueries();
      await testErrorHandling();
      await testClaraVerseAPI();
      await testLocalStorageCompatibility();
      await testMigrationCapabilities();
      await testStress();

      // Nettoyage final
      await cleanupTestData();
    } catch (error) {
      testLog(`Erreur durant les tests: ${error}`, "error");
      assert(false, `Erreur générale: ${error.message}`);
    }

    testResults.endTime = Date.now();
    generateTestReport();
  }

  // Générer rapport de test
  function generateTestReport() {
    const duration = testResults.endTime - testResults.startTime;
    const successRate = (
      (testResults.passed / testResults.total) *
      100
    ).toFixed(2);

    const report = {
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        successRate: `${successRate}%`,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      performance: testResults.performance,
      details: testResults.details,
    };

    console.group("📊 RAPPORT DE TESTS CLARAVERSE");
    console.table(report.summary);

    if (Object.keys(report.performance).length > 0) {
      console.group("⚡ Performance");
      console.table(report.performance);
      console.groupEnd();
    }

    if (testResults.failed > 0) {
      console.group("❌ Tests échoués");
      report.details
        .filter((test) => test.status === "FAIL")
        .forEach((test) => console.error(test.message));
      console.groupEnd();
    }

    console.groupEnd();

    // Sauvegarder le rapport
    const reportBlob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const reportUrl = URL.createObjectURL(reportBlob);

    testLog(`Rapport généré - Taux de réussite: ${successRate}%`);

    return report;
  }

  // Interface utilisateur pour les tests
  function createTestUI() {
    const ui = document.createElement("div");
    ui.id = "claraverse-test-ui";
    ui.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 400px;
      min-width: 300px;
    `;

    ui.innerHTML = `
      <h3 style="margin:0 0 15px 0; color:#3b82f6;">🧪 Tests ClaraVerse IndexedDB</h3>
      <p style="margin:0 0 15px 0;">Suite de tests pour vérifier le fonctionnement</p>

      <div id="test-status" style="background:#f3f4f6; padding:10px; border-radius:6px; margin-bottom:15px;">
        Prêt pour les tests
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
        <button id="run-all-tests" style="background:#3b82f6; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">
          Tous les tests
        </button>
        <button id="run-basic-tests" style="background:#10b981; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">
          Tests de base
        </button>
        <button id="run-performance-tests" style="background:#f59e0b; color:white; border:none; padding:8px 16px; border-radius:6px; cursor:pointer;">
          Performance
        </button>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button id="cleanup-test-data" style="background:#6b7280; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:10px;">
          Nettoyer
        </button>
        <button id="close-test-ui" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:10px;">
          Fermer
        </button>
      </div>

      <div id="test-progress" style="margin-top:15px; display:none;">
        <div style="background:#e5e7eb; height:4px; border-radius:2px; overflow:hidden;">
          <div id="progress-bar" style="background:#3b82f6; height:100%; width:0%; transition:width 0.3s;"></div>
        </div>
        <div id="progress-text" style="margin-top:5px; font-size:10px; color:#6b7280;"></div>
      </div>
    `;

    document.body.appendChild(ui);

    // Event listeners
    document.getElementById("run-all-tests").onclick = async () => {
      updateTestUI("Exécution de tous les tests...", true);
      await runAllTests();
      updateTestUI("Tests terminés! Voir console pour détails.", false);
    };

    document.getElementById("run-basic-tests").onclick = async () => {
      updateTestUI("Tests de base en cours...", true);
      testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: [],
        startTime: Date.now(),
      };

      testIndexedDBSupport();
      await testDatabaseCreation();
      await testCrudOperations();
      await testClaraVerseAPI();

      testResults.endTime = Date.now();
      generateTestReport();
      updateTestUI("Tests de base terminés!", false);
    };

    document.getElementById("run-performance-tests").onclick = async () => {
      updateTestUI("Tests de performance...", true);
      testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: [],
        startTime: Date.now(),
        performance: {},
      };

      await testDatabaseCreation();
      await testPerformance();
      await testStress();

      testResults.endTime = Date.now();
      generateTestReport();
      updateTestUI("Tests de performance terminés!", false);
    };

    document.getElementById("cleanup-test-data").onclick = async () => {
      if (confirm("Nettoyer toutes les données de test?")) {
        await cleanupTestData();
        updateTestUI("Données de test nettoyées", false);
      }
    };

    document.getElementById("close-test-ui").onclick = () => ui.remove();

    return ui;
  }

  function updateTestUI(message, showProgress) {
    const statusDiv = document.getElementById("test-status");
    const progressDiv = document.getElementById("test-progress");

    if (statusDiv) {
      statusDiv.innerHTML = message;
    }

    if (progressDiv) {
      progressDiv.style.display = showProgress ? "block" : "none";
    }
  }

  // Auto-initialisation des tests
  function initTestSuite() {
    testLog("Initialisation suite de tests");

    // Vérifier si IndexedDB est supporté
    if (!window.indexedDB) {
      testLog("IndexedDB non supporté!", "error");
      alert("Votre navigateur ne supporte pas IndexedDB!");
      return;
    }

    // Créer l'interface utilisateur
    createTestUI();

    testLog("Suite de tests prête");
  }

  // Démarrer quand le DOM est prêt
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTestSuite);
  } else {
    initTestSuite();
  }

  // Exposer l'API pour utilisation manuelle
  window.ClaraVerseTests = {
    runAll: runAllTests,
    runBasic: async () => {
      testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: [],
        startTime: Date.now(),
      };
      testIndexedDBSupport();
      await testDatabaseCreation();
      await testCrudOperations();
      await testClaraVerseAPI();
      testResults.endTime = Date.now();
      return generateTestReport();
    },
    runPerformance: async () => {
      testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: [],
        startTime: Date.now(),
        performance: {},
      };
      await testDatabaseCreation();
      await testPerformance();
      await testStress();
      testResults.endTime = Date.now();
      return generateTestReport();
    },
    cleanup: cleanupTestData,
    results: () => testResults,
    assert: assert,
    testLog: testLog,
  };

  testLog("Suite de tests ClaraVerse IndexedDB chargée");
})();
