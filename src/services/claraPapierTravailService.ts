/**
 * Clara Papier Travail Service
 * 
 * Specialized service for processing audit workpapers (Papiers de Travail)
 * from n8n responses and transforming them into specialized UI components.
 */

export class ClaraPapierTravailService {
  /**
   * Detects if the data is a "Papier de travail" (audit workpaper)
   */
  public detectPapierTravail(data: any): boolean {
    if (typeof data === 'string' && data.toLowerCase().includes("nature de test")) {
      return true;
    }

    if (!data) return false;

    const natureKeywords = ["nature de test", "nature_de_test", "nature de Test"];

    // Check all keys and sub-objects recursively (shallow)
    const checkObj = (obj: any): boolean => {
      if (!obj || typeof obj !== 'object') return false;

      // Check direct keys
      for (const k of Object.keys(obj)) {
        if (natureKeywords.some(kw => k.toLowerCase() === kw)) return true;

        // Check if value is a table with that key
        if (typeof obj[k] === 'object' && obj[k] !== null) {
          const sub = obj[k];
          if (Array.isArray(sub)) {
            if (sub.some(item => natureKeywords.some(kw => Object.keys(item).some(ik => ik.toLowerCase().includes(kw))))) return true;
          } else {
            if (natureKeywords.some(kw => Object.keys(sub).some(sk => sk.toLowerCase().includes(kw)))) return true;
          }
        }
      }
      return false;
    };

    if (checkObj(data)) return true;

    // Check specific known structures
    for (const key in data) {
      if (key.toLowerCase().includes("etape") || key.toLowerCase().includes("feuille")) {
        if (checkObj(data[key])) return true;
        if (Array.isArray(data[key])) {
          if (data[key].some((item: any) => checkObj(item))) return true;
        }
      }
    }

    return false;
  }

  /**
   * Pivote les deux premières tables Markdown (Signature et Couverture) 
   * pour les transformer de N-colonnes à 2 colonnes (Rubrique, Description)
   */
  public pivotMarkdownTables(markdown: string): string {
    const sections = markdown.split(/(?:\r?\n){2,}/);
    let tableIndex = 0;

    const modifiedSections = sections.map((section) => {
      const lines = section.trim().split(/\r?\n/).map(l => l.trim());
      const tableLines = lines.filter(l => l.startsWith('|'));

      if (tableLines.length < 3) return section; // Pas une table markdown valide

      // Pivot only the first two tables
      if (tableIndex === 0 || tableIndex === 1) {
        const headers = tableLines[0].split('|').map(h => h.trim()).slice(1, -1);
        const dataRows = tableLines.slice(2);

        let newTable = `| Rubrique | Description |\n|---|---|`;

        if (dataRows.length > 0) {
          const cells = dataRows[0].split('|').map(c => c.trim()).slice(1, -1);
          headers.forEach((h, i) => {
            if (h) {
              newTable += `\n| ${h} | ${cells[i] || ""} |`;
            }
          });

          tableIndex++;
          return newTable;
        }
      }

      tableIndex++;
      return section;
    });

    return modifiedSections.join('\n\n');
  }

  /**
   * Processes the data to generate the JSON structure for PapierTravailRenderer
   */
  public process(data: any): string {
    // Si c'est une string markdown, on pivote simplement les deux premières tables
    if (typeof data === 'string') {
      return this.pivotMarkdownTables(data);
    }

    try {
      const signature = this.findTable(data, ["table 0", "signature worksheet"]);
      const missionInfo = this.findTable(data, ["table 1"]);
      const objectivesTable = this.findTable(data, ["table 2", "objectifs"]);
      const tasks = this.findTable(data, ["table 3", "travaux"]);
      const testTable = this.findTable(data, ["table 5", "modelised table"]);
      const legends = this.findTable(data, ["table 9", "legendes"]);
      const managerReviewRaw = this.findTable(data, ["table 10", "revue manager"]);
      const crossRefs = this.findTable(data, ["table 8", "cross references documentaire"]);

      // Extract reference
      const reference = (missionInfo && (missionInfo[0]?.["Réf. papier de travail"] || missionInfo[0]?.["Référence"]))
        || (signature && signature[0]?.["Référence"])
        || "REF-AUDIT-" + Date.now().toString().slice(-4);

      // Extract preparer/reviewer initials
      const preparer = signature && (signature[0]?.["Préparateur"] || signature[0]?.["Preparer"] || "KMP");
      const reviewer = signature && (signature[0]?.["Superviseur"] || signature[0]?.["Reviewer"] || "JFK");

      // Extract objectives text
      const objectives = objectivesTable ? (objectivesTable[0]?.["OBJECTIFS"] || objectivesTable[0]?.["objectifs"] || Object.values(objectivesTable[0])[0]) : "";

      // Process Manager Review into RevuePoint format
      const managerReview = Array.isArray(managerReviewRaw) ? managerReviewRaw.map((row: any, idx: number) => ({
        num: row.no || row.No || (idx + 1),
        titre: row.Titre || row.Point || "Point de revue",
        statut: (row.Statut?.toLowerCase().includes("val") || row.Statut?.toLowerCase().includes("ok")) ? 'ok' :
          (row.Statut?.toLowerCase().includes("suivre") || row.Statut?.toLowerCase().includes("warn")) ? 'warn' : 'ko',
        prep: row.Preparer || row.prep || "",
        rev: row.Superviseur || row.rev || ""
      })) : [];

      const papierData = {
        reference,
        signature: Array.isArray(signature) ? signature[0] : signature,
        missionInfo: Array.isArray(missionInfo) ? missionInfo[0] : missionInfo,
        objectives: String(objectives),
        tasks: Array.isArray(tasks) ? tasks : [],
        testSection: testTable ? {
          headers: Object.keys(testTable[0] || {}),
          rows: testTable
        } : undefined,
        legends: Array.isArray(legends) ? legends : [],
        managerReview,
        crossRefs: Array.isArray(crossRefs) ? crossRefs : [],
        preparer,
        reviewer
      };

      return "__PAPIER_TRAVAIL__" + JSON.stringify(papierData);

    } catch (error) {
      console.error("Error processing Papier de Travail:", error);
      return `__ERROR__ Erreur lors du traitement du Papier de Travail: ${error}`;
    }
  }

  // Helper Methods

  private findTable(data: any, keywords: string[]): any {
    // Search in top level keys
    for (const key of Object.keys(data)) {
      if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
        return data[key];
      }
    }

    // Search inside arrays (like "Etape mission - Feuille couverture")
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) {
        for (const item of data[key]) {
          if (typeof item === 'object' && item !== null) {
            for (const subKey of Object.keys(item)) {
              if (keywords.some(kw => subKey.toLowerCase().includes(kw.toLowerCase()))) {
                return item[subKey];
              }
            }
          }
        }
      }
    }

    return null;
  }
}

export const claraPapierTravailService = new ClaraPapierTravailService();
