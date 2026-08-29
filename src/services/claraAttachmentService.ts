/**
 * Clara Attachment Service
 * Handles file attachment processing and analysis
 */

import { ClaraFileAttachment } from '../types/clara_assistant_types';
import * as XLSX from 'xlsx';

export class ClaraAttachmentService {
  /**
   * Process file attachments by analyzing them locally
   */
  public async processFileAttachments(attachments: ClaraFileAttachment[]): Promise<ClaraFileAttachment[]> {
    const processed = [...attachments];

    for (const attachment of processed) {
      try {
        // For images, we already have base64 or URL - mark as processed
        if (attachment.type === 'image') {
          attachment.processed = true;
          attachment.processingResult = {
            success: true,
            metadata: {
              type: 'image',
              processedAt: new Date().toISOString()
            }
          };
        }

        // For PDFs, documents, Excel and Word files, extract content
        if (attachment.type === 'pdf' || attachment.type === 'document' || attachment.type === 'excel' || attachment.type === 'word') {
          const extractedData = await this.extractDocumentContent(attachment);
          attachment.processed = true;
          attachment.processingResult = {
            success: extractedData.success,
            extractedText: extractedData.text,
            metadata: {
              type: attachment.type,
              processedAt: new Date().toISOString(),
              extractedData: extractedData.data,
              dataFormat: extractedData.format
            }
          };
        }

        // For code files, we can analyze the structure
        if (attachment.type === 'code') {
          attachment.processed = true;
          attachment.processingResult = {
            success: true,
            codeAnalysis: {
              language: this.detectCodeLanguage(attachment.name),
              structure: {
                functions: [],
                classes: [],
                imports: []
              },
              metrics: {
                lines: 0,
                complexity: 0
              }
            },
            metadata: {
              type: 'code',
              processedAt: new Date().toISOString()
            }
          };
        }

      } catch (error) {
        attachment.processed = false;
        attachment.processingResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed'
        };
      }
    }

    return processed;
  }

  /**
   * Detect code language from filename
   */
  private detectCodeLanguage(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    return langMap[ext || ''] || 'text';
  }

  /**
   * Extract image attachments from a list of attachments
   */
  public extractImageAttachments(attachments: ClaraFileAttachment[]): string[] {
    return attachments
      .filter(att => att.type === 'image')
      .map(att => att.base64 || att.url || '')
      .filter(Boolean);
  }

  /**
   * Check if attachments contain images
   */
  public hasImages(attachments: ClaraFileAttachment[]): boolean {
    return attachments.some(att => att.type === 'image');
  }

  /**
   * Check if attachments contain code files
   */
  public hasCodeFiles(attachments: ClaraFileAttachment[]): boolean {
    return attachments.some(att => att.type === 'code');
  }

  /**
   * Get attachment summary for display
   */
  public getAttachmentSummary(attachments: ClaraFileAttachment[]): string {
    if (attachments.length === 0) {
      return 'No attachments';
    }

    const typeCount: Record<string, number> = {};
    attachments.forEach(att => {
      typeCount[att.type] = (typeCount[att.type] || 0) + 1;
    });

    const summary = Object.entries(typeCount)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    return `Attachments: ${summary}`;
  }

  /**
   * Validate attachment before processing
   */
  public validateAttachment(attachment: ClaraFileAttachment): { valid: boolean; error?: string } {
    if (!attachment.name) {
      return { valid: false, error: 'Attachment name is required' };
    }

    if (!attachment.type) {
      return { valid: false, error: 'Attachment type is required' };
    }

    if (attachment.type === 'image' && !attachment.base64 && !attachment.url) {
      return { valid: false, error: 'Image attachments require base64 data or URL' };
    }

    if (attachment.size && attachment.size > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'Attachment size exceeds 10MB limit' };
    }

    return { valid: true };
  }

  /**
   * Filter valid attachments from a list
   */
  public filterValidAttachments(attachments: ClaraFileAttachment[]): ClaraFileAttachment[] {
    return attachments.filter(attachment => {
      const validation = this.validateAttachment(attachment);
      if (!validation.valid) {
        console.warn(`Invalid attachment ${attachment.name}: ${validation.error}`);
        return false;
      }
      return true;
    });
  }

  /**
   * Get extracted data formatted specifically for Flowise endpoint
   */
  public getExtractedDataForFlowise(attachments: ClaraFileAttachment[]): any {
    return this.formatExcelDataForFlowise(attachments);
  }

  /**
   * Get extracted data from attachments for sending to n8n endpoint
   * Enhanced to include hierarchical structure for Word and PDF files
   */
  public getExtractedDataForN8N(attachments: ClaraFileAttachment[]): any {
    const extractedData: any = {
      files: [],
      hasExtractedContent: false,
      totalFiles: attachments.length
    };

    attachments.forEach(attachment => {
      if (attachment.processed && attachment.processingResult?.success) {
        const fileData: any = {
          filename: attachment.name,
          type: attachment.type,
          size: attachment.size,
          mimeType: attachment.mimeType,
          processed: true,
          extractedText: attachment.processingResult.extractedText || '',
          metadata: attachment.processingResult.metadata || {}
        };

        // Add structured data if available
        if (attachment.processingResult.metadata?.extractedData) {
          const dataFormat = attachment.processingResult.metadata.dataFormat;
          
          // For Word and PDF, use the hierarchical structure
          if (dataFormat === 'word' || dataFormat === 'pdf') {
            // The extractedData already contains the hierarchical structure
            fileData.structuredData = attachment.processingResult.metadata.extractedData;
            fileData.hierarchicalData = attachment.processingResult.metadata.extractedData;
            console.log(`📄 ${dataFormat.toUpperCase()} hierarchical data included for:`, attachment.name);
          } else {
            fileData.structuredData = attachment.processingResult.metadata.extractedData;
          }
          
          fileData.dataFormat = dataFormat;
          extractedData.hasExtractedContent = true;
        }

        extractedData.files.push(fileData);
      } else {
        // Include unprocessed files info
        extractedData.files.push({
          filename: attachment.name,
          type: attachment.type,
          size: attachment.size,
          mimeType: attachment.mimeType,
          processed: false,
          error: attachment.processingResult?.error || 'Not processed'
        });
      }
    });

    return extractedData;
  }

  /**
   * Format Excel data for Flowise endpoint in the specific JSON structure
   */
  private formatExcelDataForFlowise(attachments: ClaraFileAttachment[]): any {
    console.log('🔍 DEBUG - formatExcelDataForFlowise called with attachments:', attachments.length);
    const flowiseData: any = {};

    attachments.forEach((attachment, index) => {
      console.log(`🔍 DEBUG - Processing attachment ${index + 1}:`, {
        name: attachment.name,
        type: attachment.type,
        processed: attachment.processed,
        hasResult: !!attachment.processingResult,
        hasExtractedData: !!attachment.processingResult?.metadata?.extractedData
      });

      const isExcelFile = attachment.type === 'excel' || 
                          attachment.type === 'document' || 
                          attachment.name.toLowerCase().endsWith('.xlsx') || 
                          attachment.name.toLowerCase().endsWith('.xls') ||
                          attachment.processingResult?.metadata?.dataFormat === 'excel';

      if (attachment.processed && 
          attachment.processingResult?.success && 
          attachment.processingResult.metadata?.extractedData &&
          isExcelFile) {
        
        const extractedData = attachment.processingResult.metadata.extractedData;
        const fileName = attachment.name.replace(/\.(xlsx|xls)$/i, '');
        
        console.log(`🔍 DEBUG - Processing Excel file: ${fileName}`);
        console.log('🔍 DEBUG - Extracted data:', extractedData);
        
        // Create the main structure with filename as key
        flowiseData[fileName] = [];
        
        let tableIndex = 1;
        
        // Process each sheet
        Object.keys(extractedData).forEach(sheetName => {
          const sheetData = extractedData[sheetName];
          console.log(`🔍 DEBUG - Processing sheet: ${sheetName}`, sheetData);
          
          if (Array.isArray(sheetData) && sheetData.length > 0) {
            // If sheet has data, create table structure
            if (sheetData.length === 1) {
              // Single row - treat as key-value pairs
              const tableObj: any = {};
              tableObj[`table ${tableIndex}`] = {};
              
              if (Array.isArray(sheetData[0])) {
                // Array format - use indices as keys
                sheetData[0].forEach((value: any, index: number) => {
                  tableObj[`table ${tableIndex}`][`col_${index + 1}`] = value;
                });
              } else {
                // Object format
                tableObj[`table ${tableIndex}`] = sheetData[0];
              }
              
              flowiseData[fileName].push(tableObj);
              console.log(`🔍 DEBUG - Added single row table ${tableIndex}:`, tableObj);
            } else {
              // Multiple rows - treat as array of objects
              const tableObj: any = {};
              tableObj[`table ${tableIndex}`] = [];
              
              if (sheetData.length > 1) {
                const headers = sheetData[0]; // First row as headers
                const dataRows = sheetData.slice(1); // Remaining rows as data
                
                console.log(`🔍 DEBUG - Headers:`, headers);
                console.log(`🔍 DEBUG - Data rows:`, dataRows.length);
                
                dataRows.forEach((row: any[]) => {
                  const rowObj: any = {};
                  if (Array.isArray(headers) && Array.isArray(row)) {
                    headers.forEach((header: any, index: number) => {
                      rowObj[header || `col_${index + 1}`] = row[index] || '';
                    });
                  }
                  tableObj[`table ${tableIndex}`].push(rowObj);
                });
              }
              
              flowiseData[fileName].push(tableObj);
              console.log(`🔍 DEBUG - Added multi-row table ${tableIndex}:`, tableObj);
            }
            
            tableIndex++;
          }
        });
      } else {
        console.log(`🔍 DEBUG - Skipping attachment ${attachment.name} - not Excel or missing data`);
      }
    });

    console.log('🔍 DEBUG - Final Flowise data:', flowiseData);
    return flowiseData;
  }

  /**
   * Format data for n8n endpoint according to the structured specification:
   * - User_message: Array of key-value pairs from user input
   * - Excel files: "filename.xlsx" with "onglet_X - table Y" structure
   * - Word files: "filename.doc" with numbered sections
   */
  public formatDataForN8nStructured(userMessage: string, attachments: ClaraFileAttachment[]): any[] {
    console.log('📦 formatDataForN8nStructured - Building structured payload');
    const result: any[] = [];

    // 1. Parse User_message from the input text
    const userMessageObj = this.parseUserMessageToStructured(userMessage);
    if (userMessageObj) {
      result.push({ "User_message": userMessageObj });
    }

    // 2. Process each attachment
    attachments.forEach(attachment => {
      if (!attachment.processed || !attachment.processingResult?.success) {
        console.log(`⚠️ Skipping unprocessed attachment: ${attachment.name}`);
        return;
      }

      const fileName = attachment.name;
      const isExcel = attachment.type === 'excel' || 
                      fileName.toLowerCase().endsWith('.xlsx') || 
                      fileName.toLowerCase().endsWith('.xls') ||
                      attachment.processingResult?.metadata?.dataFormat === 'excel';
      
      const isWord = attachment.type === 'word' || 
                     fileName.toLowerCase().endsWith('.doc') || 
                     fileName.toLowerCase().endsWith('.docx');

      const isPdf = attachment.type === 'pdf' || 
                    fileName.toLowerCase().endsWith('.pdf') ||
                    attachment.processingResult?.metadata?.dataFormat === 'pdf';

      if (isExcel && attachment.processingResult.metadata?.extractedData) {
        const excelData = this.formatExcelForN8nStructured(fileName, attachment.processingResult.metadata.extractedData);
        if (excelData) {
          result.push(excelData);
        }
      } else if (isWord && attachment.processingResult.extractedText) {
        const wordData = this.formatWordForN8nStructured(fileName, attachment.processingResult.extractedText);
        if (wordData) {
          result.push(wordData);
        }
      } else if (isPdf && attachment.processingResult.extractedText) {
        const pdfData = this.formatPdfForN8nStructured(fileName, attachment.processingResult.extractedText);
        if (pdfData) {
          result.push(pdfData);
        }
      }
    });

    console.log('📦 Final structured payload:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Parse user message text into structured key-value pairs
   * Detects patterns like [Command] = value, [Processus] = value, etc.
   */
  private parseUserMessageToStructured(message: string): any[] | null {
    const result: any[] = [];
    
    // Remove DISPLAY_META if present
    let cleanMessage = message.replace(/\[DISPLAY_META:[\s\S]*?\]\n\n/g, '');
    
    // Remove file content sections
    cleanMessage = cleanMessage.replace(/--- Content from [\s\S]*?--- End of .*? ---\n\n/g, '');
    
    // Extract "User Question:" part if present
    const userQuestionMatch = cleanMessage.match(/User Question:\s*([\s\S]*?)$/);
    if (userQuestionMatch) {
      cleanMessage = userQuestionMatch[1].trim();
    }

    // Parse [Key] = Value patterns
    const keyValueRegex = /\[([^\]]+)\]\s*[=:]\s*([^\[\n]*)/g;
    let match;
    
    while ((match = keyValueRegex.exec(cleanMessage)) !== null) {
      const key = `[${match[1].trim()}]`;
      let value: string | number = match[2].trim();
      
      // Try to convert to number if applicable
      if (/^\d+$/.test(value)) {
        value = parseInt(value, 10);
      }
      
      result.push({ [key]: value });
    }

    // If no structured data found, create a simple message entry
    if (result.length === 0 && cleanMessage.trim()) {
      result.push({ "[Message]": cleanMessage.trim() });
    }

    return result.length > 0 ? result : null;
  }

  /**
   * Format Excel data with "onglet_X - table Y" structure
   */
  private formatExcelForN8nStructured(fileName: string, extractedData: any): any | null {
    const tables: any[] = [];
    let ongletIndex = 1;

    Object.keys(extractedData).forEach(sheetName => {
      const sheetData = extractedData[sheetName];
      
      if (Array.isArray(sheetData) && sheetData.length > 1) {
        // First row is headers, rest is data
        const headers = sheetData[0];
        const dataRows = sheetData.slice(1);
        
        // Create table with "onglet_X - table Y" key
        const tableKey = `onglet_${ongletIndex} - table 1`;
        const tableData: any[] = [];
        
        dataRows.forEach((row: any[]) => {
          if (Array.isArray(row)) {
            const rowObj: any = {};
            headers.forEach((header: any, colIndex: number) => {
              const headerName = header || `col_${colIndex + 1}`;
              rowObj[headerName] = row[colIndex] !== undefined ? row[colIndex] : '';
            });
            tableData.push(rowObj);
          }
        });
        
        if (tableData.length > 0) {
          tables.push({ [tableKey]: tableData });
        }
        
        ongletIndex++;
      }
    });

    if (tables.length > 0) {
      return { [fileName]: tables };
    }
    
    return null;
  }

  /**
   * Format Word document with hierarchical nested JSON structure
   * Parses titles (1, 1.1, 1.1.1, a, b, etc.) and creates nested structure
   * Paragraphs are numbered as "paragraphe_1", "paragraphe_2", etc.
   * Tables are numbered as "table_1", "table_2", etc.
   */
  private formatWordForN8nStructured(fileName: string, extractedText: string): any | null {
    console.log('📄 formatWordForN8nStructured - Processing:', fileName);
    
    // Clean the text
    let cleanText = extractedText
      .replace(/📄 Contenu extrait du document Word:.*?\n\n/g, '')
      .trim();

    // Use the hierarchical parser
    const hierarchicalData = this.parseWordToHierarchicalJson(cleanText);
    
    if (hierarchicalData && Object.keys(hierarchicalData).length > 0) {
      return { [fileName]: hierarchicalData };
    }
    
    // Fallback: simple structure
    return { [fileName]: { "paragraphe_1": cleanText } };
  }

  /**
   * Parse Word document text into hierarchical nested JSON
   * Detects heading patterns: 
   * - Roman numerals (I, II, III, IV, V, etc.)
   * - Numbers with dots (1, 1.1, 1.1.1, 2, 2.1, etc.)
   * - Letters (a, b, c, A, B, C)
   * - Bullet points (-, •, *)
   */
  private parseWordToHierarchicalJson(text: string): any {
    console.log('🔍 parseWordToHierarchicalJson - Starting hierarchical parsing');
    
    // Split text into lines for processing
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return { "paragraphe_1": text };
    }

    // Heading detection patterns with hierarchy levels
    const headingPatterns = [
      // Roman numerals (Level 1): I., II., III., IV., V., VI., VII., VIII., IX., X.
      { regex: /^(I{1,3}|IV|V|VI{0,3}|IX|X)\.\s+(.+)$/i, level: 1, type: 'roman' },
      // Main chapters (Level 1): 1., 2., 3., etc. (single digit followed by dot)
      { regex: /^(\d)\.\s+(.+)$/, level: 1, type: 'chapter' },
      // Sub-sections (Level 2): 1.1, 2.1, etc.
      { regex: /^(\d+\.\d+)\s+(.+)$/, level: 2, type: 'section' },
      // Sub-sub-sections (Level 3): 1.1.1, 2.1.1, etc.
      { regex: /^(\d+\.\d+\.\d+)\s+(.+)$/, level: 3, type: 'subsection' },
      // Deep sections (Level 4): 1.1.1.1, etc.
      { regex: /^(\d+\.\d+\.\d+\.\d+)\s+(.+)$/, level: 4, type: 'subsubsection' },
      // Uppercase letters (Level 2): A., B., C., etc.
      { regex: /^([A-Z])\.\s+(.+)$/, level: 2, type: 'letter_upper' },
      // Lowercase letters (Level 3): a., b., c., etc.
      { regex: /^([a-z])\.\s+(.+)$/, level: 3, type: 'letter_lower' },
      // Parenthesized letters (Level 3): (a), (b), (c), etc.
      { regex: /^\(([a-z])\)\s+(.+)$/i, level: 3, type: 'letter_paren' },
      // Parenthesized numbers (Level 3): (1), (2), (3), etc.
      { regex: /^\((\d+)\)\s+(.+)$/, level: 3, type: 'number_paren' },
      // Bullet points (Level 4): -, •, *, etc.
      { regex: /^[-•\*]\s+(.+)$/, level: 4, type: 'bullet' },
    ];

    // Table detection pattern
    const tableStartPattern = /^\|.*\|$/;
    const tableRowPattern = /^\|.*\|$/;

    // Build hierarchical structure
    const result: any = {};
    const stack: { level: number; key: string; obj: any }[] = [{ level: 0, key: 'root', obj: result }];
    
    let paragraphCounter = 1;
    let tableCounter = 1;
    let currentParagraphLines: string[] = [];
    let currentTableLines: string[] = [];
    let inTable = false;

    const flushParagraph = (targetObj: any) => {
      if (currentParagraphLines.length > 0) {
        const paragraphText = currentParagraphLines.join(' ').trim();
        if (paragraphText) {
          targetObj[`paragraphe_${paragraphCounter}`] = paragraphText;
          paragraphCounter++;
        }
        currentParagraphLines = [];
      }
    };

    const flushTable = (targetObj: any) => {
      if (currentTableLines.length > 0) {
        const tableData = this.parseTableFromLines(currentTableLines);
        if (tableData.length > 0) {
          targetObj[`table_${tableCounter}`] = tableData;
          tableCounter++;
        }
        currentTableLines = [];
        inTable = false;
      }
    };

    const getCurrentTarget = () => {
      return stack[stack.length - 1].obj;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for table
      if (tableStartPattern.test(line)) {
        flushParagraph(getCurrentTarget());
        inTable = true;
        currentTableLines.push(line);
        continue;
      }
      
      if (inTable) {
        if (tableRowPattern.test(line)) {
          currentTableLines.push(line);
          continue;
        } else {
          flushTable(getCurrentTarget());
        }
      }

      // Check for headings
      let isHeading = false;
      for (const pattern of headingPatterns) {
        const match = line.match(pattern.regex);
        if (match) {
          isHeading = true;
          
          // Flush any pending paragraph
          flushParagraph(getCurrentTarget());
          
          // Determine heading key and content
          let headingKey: string;
          let headingContent: string | undefined;
          
          if (pattern.type === 'bullet') {
            headingKey = match[1]; // Just the bullet content
            headingContent = undefined;
          } else {
            headingKey = match[1]; // The number/letter
            headingContent = match[2]; // The title text
          }

          // Pop stack until we find appropriate parent level
          while (stack.length > 1 && stack[stack.length - 1].level >= pattern.level) {
            stack.pop();
          }

          // Create new section
          const parentObj = getCurrentTarget();
          const sectionKey = headingContent ? `${headingKey}. ${headingContent}` : headingKey;
          
          // Initialize as object for nested content
          parentObj[sectionKey] = {};
          
          // Push to stack
          stack.push({ level: pattern.level, key: sectionKey, obj: parentObj[sectionKey] });
          
          // Reset counters for new section
          paragraphCounter = 1;
          tableCounter = 1;
          
          break;
        }
      }

      // If not a heading, accumulate as paragraph
      if (!isHeading && !inTable) {
        currentParagraphLines.push(line);
      }
    }

    // Flush remaining content
    flushTable(getCurrentTarget());
    flushParagraph(getCurrentTarget());

    // Clean up empty objects and convert single-paragraph sections
    this.cleanupHierarchicalStructure(result);

    console.log('📄 parseWordToHierarchicalJson - Result:', JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Parse table lines (markdown-style) into array of objects
   */
  private parseTableFromLines(lines: string[]): any[] {
    if (lines.length < 2) return [];

    const result: any[] = [];
    
    // Parse header row
    const headerLine = lines[0];
    const headers = headerLine.split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);

    // Skip separator line if present (e.g., |---|---|)
    let dataStartIndex = 1;
    if (lines.length > 1 && /^[\|\-\s:]+$/.test(lines[1])) {
      dataStartIndex = 2;
    }

    // Parse data rows
    for (let i = dataStartIndex; i < lines.length; i++) {
      const cells = lines[i].split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
      
      if (cells.length > 0) {
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = cells[index] || '';
        });
        result.push(rowObj);
      }
    }

    return result;
  }

  /**
   * Clean up hierarchical structure:
   * - Remove empty objects
   * - Convert objects with only one paragraph to string value
   */
  private cleanupHierarchicalStructure(obj: any): void {
    if (typeof obj !== 'object' || obj === null) return;

    const keys = Object.keys(obj);
    
    for (const key of keys) {
      const value = obj[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively clean nested objects
        this.cleanupHierarchicalStructure(value);
        
        const valueKeys = Object.keys(value);
        
        // Remove empty objects
        if (valueKeys.length === 0) {
          delete obj[key];
        }
        // Convert single paragraph to direct string value
        else if (valueKeys.length === 1 && valueKeys[0] === 'paragraphe_1') {
          obj[key] = value['paragraphe_1'];
        }
      }
    }
  }

  /**
   * Show extraction confirmation alert with Flowise JSON format
   */
  public showExtractionAlert(attachments: ClaraFileAttachment[]): void {
    console.log('🔍 DEBUG - showExtractionAlert called with attachments:', attachments);
    
    const processedFiles = attachments.filter(att => att.processed && att.processingResult?.success);
    const failedFiles = attachments.filter(att => att.processed && !att.processingResult?.success);
    
    // Debug: Log all processed files with their types
    console.log('🔍 DEBUG - Processed files:', processedFiles.map(f => ({
      name: f.name,
      type: f.type,
      hasExtractedData: !!f.processingResult?.metadata?.extractedData,
      dataFormat: f.processingResult?.metadata?.dataFormat
    })));
    
    const excelFiles = processedFiles.filter(att => {
      const isExcel = att.type === 'excel' || 
                     att.type === 'document' || // Fallback for documents
                     att.name.toLowerCase().endsWith('.xlsx') || 
                     att.name.toLowerCase().endsWith('.xls');
      const hasExtractedData = att.processingResult?.metadata?.extractedData;
      const dataFormat = att.processingResult?.metadata?.dataFormat;
      
      console.log(`🔍 DEBUG - File ${att.name}: type=${att.type}, isExcel=${isExcel}, hasExtractedData=${!!hasExtractedData}, dataFormat=${dataFormat}`);
      
      // Accept if it's Excel type OR if it has Excel data format
      return (isExcel || dataFormat === 'excel') && hasExtractedData;
    });
    
    console.log('🔍 DEBUG - Excel files found:', excelFiles.length);

    let message = `📊 Extraction des fichiers terminée !\n\n`;
    
    if (processedFiles.length > 0) {
      message += `✅ Fichiers traités avec succès (${processedFiles.length}):\n`;
      processedFiles.forEach(file => {
        const format = file.processingResult?.metadata?.dataFormat || file.type;
        message += `  • ${file.name} (${format})\n`;
      });
    }

    if (failedFiles.length > 0) {
      message += `\n❌ Fichiers non traités (${failedFiles.length}):\n`;
      failedFiles.forEach(file => {
        message += `  • ${file.name}: ${file.processingResult?.error || 'Erreur inconnue'}\n`;
      });
    }

    // Add Flowise JSON format for Excel files
    if (excelFiles.length > 0) {
      console.log('🔍 DEBUG - Generating Flowise data for Excel files...');
      const flowiseData = this.formatExcelDataForFlowise(excelFiles);
      console.log('🔍 DEBUG - Generated Flowise data:', flowiseData);
      
      message += `\n📤 Données Excel formatées pour l'endpoint Flowise:\n\n`;
      message += `${JSON.stringify(flowiseData, null, 2)}`;
    } else {
      console.log('🔍 DEBUG - No Excel files found, adding debug info to message');
      message += `\n🔍 DEBUG - Aucun fichier Excel détecté pour le formatage Flowise`;
      message += `\nTypes de fichiers détectés: ${processedFiles.map(f => `${f.name} (${f.type}) - dataFormat: ${f.processingResult?.metadata?.dataFormat}`).join(', ')}`;
      
      // Force test with any processed file that might be Excel
      const potentialExcelFiles = processedFiles.filter(att => 
        att.name.toLowerCase().includes('.xlsx') || 
        att.name.toLowerCase().includes('.xls') ||
        att.processingResult?.metadata?.dataFormat === 'excel'
      );
      
      if (potentialExcelFiles.length > 0) {
        console.log('🔍 DEBUG - Found potential Excel files, forcing Flowise format...');
        const forcedFlowiseData = this.formatExcelDataForFlowise(potentialExcelFiles);
        if (Object.keys(forcedFlowiseData).length > 0) {
          message += `\n\n📤 FORCED - Données Excel formatées pour l'endpoint Flowise:\n\n`;
          message += `${JSON.stringify(forcedFlowiseData, null, 2)}`;
        }
      }
    }

    message += `\n\n📤 Les données extraites seront incluses dans votre message vers l'endpoint Flowise.`;

    // Show browser alert
    alert(message);
    
    // Also log to console for debugging
    console.log('📊 Extraction Summary:', {
      total: attachments.length,
      processed: processedFiles.length,
      failed: failedFiles.length,
      excelFiles: excelFiles.length,
      extractedData: this.getExtractedDataForN8N(attachments),
      flowiseFormat: excelFiles.length > 0 ? this.formatExcelDataForFlowise(excelFiles) : null
    });
  }

  /**
   * Extract content from Excel and Word documents
   */
  private async extractDocumentContent(attachment: ClaraFileAttachment): Promise<{
    success: boolean;
    text: string;
    data?: any;
    format?: string;
    error?: string;
  }> {
    try {
      if (!attachment.base64) {
        return {
          success: false,
          text: '',
          error: 'No file content available for extraction'
        };
      }

      const fileExtension = attachment.name.toLowerCase().split('.').pop();
      
      // Check by file type first, then by extension
      if (attachment.type === 'excel' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        console.log('🔍 DEBUG - Routing to Excel extraction');
        return await this.extractExcelContent(attachment);
      } else if (attachment.type === 'word' || fileExtension === 'docx') {
        console.log('🔍 DEBUG - Routing to Word extraction');
        return await this.extractWordContent(attachment);
      } else if (attachment.type === 'pdf' || fileExtension === 'pdf') {
        console.log('🔍 DEBUG - Routing to PDF extraction');
        return await this.extractPdfContent(attachment);
      } else {
        console.log('🔍 DEBUG - Unsupported document type:', fileExtension, 'attachment type:', attachment.type);
        return {
          success: false,
          text: '',
          error: `Unsupported document type: ${fileExtension} (type: ${attachment.type})`
        };
      }
    } catch (error) {
      console.error('Error extracting document content:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      };
    }
  }

  /**
   * Extract content from Excel files (.xlsx, .xls)
   */
  private async extractExcelContent(attachment: ClaraFileAttachment): Promise<{
    success: boolean;
    text: string;
    data?: any;
    format?: string;
    error?: string;
  }> {
    console.log('🔍 DEBUG - extractExcelContent called for:', attachment.name);
    console.log('🔍 DEBUG - Has base64:', !!attachment.base64);
    
    try {
      if (!attachment.base64) {
        console.log('🔍 DEBUG - No base64 data found');
        return {
          success: false,
          text: '',
          error: 'No base64 data available'
        };
      }

      // Convert base64 to binary
      const base64Data = attachment.base64.includes(',') ? attachment.base64.split(',')[1] : attachment.base64;
      console.log('🔍 DEBUG - Base64 data length:', base64Data.length);
      
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log('🔍 DEBUG - Binary data length:', bytes.length);

      // Read Excel file
      const workbook = XLSX.read(bytes, { type: 'array' });
      console.log('🔍 DEBUG - Workbook loaded, sheets:', workbook.SheetNames);
      
      const extractedData: any = {};
      let extractedText = `📊 Données extraites du fichier Excel: ${attachment.name}\n\n`;

      // Process each worksheet
      workbook.SheetNames.forEach((sheetName) => {
        console.log(`🔍 DEBUG - Processing sheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON for structured data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log(`🔍 DEBUG - Sheet ${sheetName} data:`, jsonData);
        extractedData[sheetName] = jsonData;

        // Convert to text for display
        const csvText = XLSX.utils.sheet_to_csv(worksheet);
        
        extractedText += `📋 Feuille "${sheetName}":\n`;
        if (csvText.trim()) {
          // Format as table for better readability
          const rows = csvText.split('\n').filter(row => row.trim());
          if (rows.length > 0) {
            extractedText += rows.slice(0, 10).map(row => `  ${row}`).join('\n');
            if (rows.length > 10) {
              extractedText += `\n  ... (${rows.length - 10} lignes supplémentaires)`;
            }
          } else {
            extractedText += '  (Feuille vide)';
          }
        } else {
          extractedText += '  (Feuille vide)';
        }
        extractedText += '\n\n';
      });

      // Add summary
      extractedText += `📈 Résumé:\n`;
      extractedText += `  • ${workbook.SheetNames.length} feuille(s) de calcul\n`;
      extractedText += `  • Feuilles: ${workbook.SheetNames.join(', ')}\n`;

      console.log('🔍 DEBUG - Final extracted data:', extractedData);
      console.log('🔍 DEBUG - Final extracted text length:', extractedText.length);

      return {
        success: true,
        text: extractedText,
        data: extractedData,
        format: 'excel'
      };
    } catch (error) {
      console.error('🔍 DEBUG - Error extracting Excel content:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Excel extraction failed'
      };
    }
  }

  /**
   * Extract content from Word documents (.docx)
   * Enhanced to extract structured content including tables
   */
  private async extractWordContent(attachment: ClaraFileAttachment): Promise<{
    success: boolean;
    text: string;
    data?: any;
    format?: string;
    error?: string;
  }> {
    try {
      // Convert base64 to binary
      const base64Data = attachment.base64!.includes(',') ? attachment.base64!.split(',')[1] : attachment.base64!;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // For Word documents, we'll use JSZip to extract content
      const JSZip = await import('jszip');
      const zip = await JSZip.default.loadAsync(bytes);
      
      // Extract document.xml which contains the main text content
      const documentXml = await zip.file('word/document.xml')?.async('string');
      
      if (!documentXml) {
        return {
          success: false,
          text: '',
          error: 'Could not find document content in Word file'
        };
      }

      // Parse the XML to extract structured content
      const structuredContent = this.parseWordXmlToStructured(documentXml);
      
      // Format the output text
      const formattedText = `📄 Contenu extrait du document Word: ${attachment.name}\n\n${structuredContent.text}`;

      return {
        success: true,
        text: formattedText,
        data: structuredContent.data,
        format: 'word'
      };
    } catch (error) {
      console.error('Error extracting Word content:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Word extraction failed'
      };
    }
  }

  /**
   * Extract content from PDF files (.pdf)
   * Uses pdfjs-dist to extract text and structure it hierarchically
   */
  private async extractPdfContent(attachment: ClaraFileAttachment): Promise<{
    success: boolean;
    text: string;
    data?: any;
    format?: string;
    error?: string;
  }> {
    console.log('📄 DEBUG - extractPdfContent called for:', attachment.name);
    
    try {
      // Convert base64 to binary
      const base64Data = attachment.base64!.includes(',') ? attachment.base64!.split(',')[1] : attachment.base64!;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Import pdfjs-dist dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - use CDN for browser compatibility
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdfDoc = await loadingTask.promise;
      
      console.log(`📄 DEBUG - PDF loaded, pages: ${pdfDoc.numPages}`);

      // Extract text from all pages
      const pageTexts: string[] = [];
      const allTextItems: Array<{text: string, fontSize: number, fontName: string, y: number, page: number}> = [];
      
      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let pageText = '';
        let lastY: number | null = null;
        
        textContent.items.forEach((item: any) => {
          if ('str' in item) {
            const text = item.str;
            const transform = item.transform;
            const y = transform ? transform[5] : 0;
            const fontSize = transform ? Math.abs(transform[0]) : 12;
            const fontName = item.fontName || '';
            
            // Detect line breaks based on Y position change
            if (lastY !== null && Math.abs(y - lastY) > 5) {
              pageText += '\n';
            }
            
            pageText += text;
            lastY = y;
            
            // Store text items with metadata for structure detection
            if (text.trim()) {
              allTextItems.push({
                text: text.trim(),
                fontSize,
                fontName,
                y,
                page: pageNum
              });
            }
          }
        });
        
        pageTexts.push(pageText);
      }

      // Combine all pages
      const fullText = pageTexts.join('\n\n--- Page Break ---\n\n');
      
      // Parse into hierarchical structure (same as Word)
      const hierarchicalData = this.parsePdfToHierarchicalJson(fullText, allTextItems);
      
      // Format the output text
      const formattedText = `📄 Contenu extrait du document PDF: ${attachment.name}\n\n${fullText}`;

      console.log('📄 DEBUG - PDF extraction complete');
      
      return {
        success: true,
        text: formattedText,
        data: hierarchicalData,
        format: 'pdf'
      };
    } catch (error) {
      console.error('📄 DEBUG - Error extracting PDF content:', error);
      return {
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'PDF extraction failed'
      };
    }
  }

  /**
   * Parse PDF text into hierarchical nested JSON
   * Similar to Word parsing but adapted for PDF structure
   */
  private parsePdfToHierarchicalJson(
    text: string, 
    _textItems: Array<{text: string, fontSize: number, fontName: string, y: number, page: number}>
  ): any {
    console.log('🔍 parsePdfToHierarchicalJson - Starting hierarchical parsing');
    
    // Use the same hierarchical parser as Word documents
    // The text structure should be similar after extraction
    // Note: _textItems can be used in the future for font-size based heading detection
    return this.parseWordToHierarchicalJson(text);
  }

  /**
   * Format PDF data for n8n endpoint with hierarchical structure
   */
  private formatPdfForN8nStructured(fileName: string, extractedText: string): any | null {
    console.log('📄 formatPdfForN8nStructured - Processing:', fileName);
    
    // Clean the text
    let cleanText = extractedText
      .replace(/📄 Contenu extrait du document PDF:.*?\n\n/g, '')
      .replace(/--- Page Break ---/g, '\n')
      .trim();

    // Use the same hierarchical parser as Word
    const hierarchicalData = this.parseWordToHierarchicalJson(cleanText);
    
    if (hierarchicalData && Object.keys(hierarchicalData).length > 0) {
      return { [fileName]: hierarchicalData };
    }
    
    // Fallback: simple structure
    return { [fileName]: { "paragraphe_1": cleanText } };
  }

  /**
   * Parse Word XML to extract structured content with headings and tables
   */
  private parseWordXmlToStructured(xml: string): { text: string; data: any } {
    const textParts: string[] = [];
    
    // Regex patterns for parsing
    const styleRegex = /<w:pStyle\s+w:val="([^"]+)"/;
    const outlineLvlRegex = /<w:outlineLvl\s+w:val="(\d+)"/;
    
    // First pass: extract all content in order
    const contentBlocks: Array<{type: 'paragraph' | 'table' | 'heading', content: any, level?: number}> = [];
    
    // Find all paragraphs and tables in order
    const combinedRegex = /<w:p[^>]*>[\s\S]*?<\/w:p>|<w:tbl>[\s\S]*?<\/w:tbl>/g;
    let match;
    
    while ((match = combinedRegex.exec(xml)) !== null) {
      const content = match[0];
      
      if (content.startsWith('<w:tbl>')) {
        // Parse table
        const tableData = this.parseWordTable(content);
        if (tableData.length > 0) {
          contentBlocks.push({ type: 'table', content: tableData });
        }
      } else {
        // Parse paragraph
        const styleMatch = content.match(styleRegex);
        const outlineMatch = content.match(outlineLvlRegex);
        
        // Extract text from paragraph
        let paragraphText = '';
        let textMatch;
        const textRegexLocal = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        while ((textMatch = textRegexLocal.exec(content)) !== null) {
          paragraphText += textMatch[1];
        }
        
        paragraphText = paragraphText.trim();
        
        if (paragraphText) {
          // Check if it's a heading
          const style = styleMatch ? styleMatch[1] : '';
          const outlineLevel = outlineMatch ? parseInt(outlineMatch[1]) : -1;
          
          const isHeading = style.toLowerCase().includes('heading') || 
                           style.toLowerCase().includes('titre') ||
                           outlineLevel >= 0;
          
          if (isHeading) {
            const level = outlineLevel >= 0 ? outlineLevel + 1 : this.getHeadingLevelFromStyle(style);
            contentBlocks.push({ type: 'heading', content: paragraphText, level });
          } else {
            contentBlocks.push({ type: 'paragraph', content: paragraphText });
          }
        }
      }
    }

    // Build hierarchical structure from content blocks
    const hierarchicalResult = this.buildHierarchyFromBlocks(contentBlocks);
    
    // Build text representation
    contentBlocks.forEach(block => {
      if (block.type === 'heading') {
        const prefix = '#'.repeat(block.level || 1);
        textParts.push(`\n${prefix} ${block.content}\n`);
      } else if (block.type === 'paragraph') {
        textParts.push(block.content);
      } else if (block.type === 'table') {
        textParts.push('\n[Table]\n' + this.tableToText(block.content) + '\n');
      }
    });

    return {
      text: textParts.join('\n'),
      data: hierarchicalResult
    };
  }

  /**
   * Parse a Word table XML to array of objects
   */
  private parseWordTable(tableXml: string): any[] {
    const rows: any[] = [];
    const rowRegex = /<w:tr[^>]*>([\s\S]*?)<\/w:tr>/g;
    
    let headers: string[] = [];
    let isFirstRow = true;
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableXml)) !== null) {
      const rowContent = rowMatch[1];
      const cells: string[] = [];
      let cellMatch;
      
      const cellRegexLocal = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g;
      while ((cellMatch = cellRegexLocal.exec(rowContent)) !== null) {
        const cellContent = cellMatch[1];
        let cellText = '';
        let textMatch;
        const textRegexLocal = /<w:t[^>]*>([^<]*)<\/w:t>/g;
        while ((textMatch = textRegexLocal.exec(cellContent)) !== null) {
          cellText += textMatch[1];
        }
        cells.push(cellText.trim());
      }
      
      if (isFirstRow) {
        headers = cells.map((cell, index) => cell || `col_${index + 1}`);
        isFirstRow = false;
      } else {
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = cells[index] || '';
        });
        rows.push(rowObj);
      }
    }
    
    return rows;
  }

  /**
   * Get heading level from Word style name
   */
  private getHeadingLevelFromStyle(style: string): number {
    const match = style.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    if (style.toLowerCase().includes('title') || style.toLowerCase().includes('titre')) {
      return 1;
    }
    return 2;
  }

  /**
   * Build hierarchical structure from content blocks
   */
  private buildHierarchyFromBlocks(blocks: Array<{type: string, content: any, level?: number}>): any {
    const result: any = {};
    const stack: Array<{level: number, obj: any}> = [{ level: 0, obj: result }];
    
    let paragraphCounter = 1;
    let tableCounter = 1;
    
    const getCurrentTarget = () => stack[stack.length - 1].obj;
    
    blocks.forEach(block => {
      if (block.type === 'heading') {
        const level = block.level || 1;
        
        // Pop stack until we find appropriate parent
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }
        
        const parent = getCurrentTarget();
        const headingKey = block.content;
        parent[headingKey] = {};
        
        stack.push({ level, obj: parent[headingKey] });
        
        // Reset counters for new section
        paragraphCounter = 1;
        tableCounter = 1;
        
      } else if (block.type === 'paragraph') {
        const target = getCurrentTarget();
        target[`paragraphe_${paragraphCounter}`] = block.content;
        paragraphCounter++;
        
      } else if (block.type === 'table') {
        const target = getCurrentTarget();
        target[`table_${tableCounter}`] = block.content;
        tableCounter++;
      }
    });
    
    // Clean up the structure
    this.cleanupHierarchicalStructure(result);
    
    return result;
  }

  /**
   * Convert table data to text representation
   */
  private tableToText(tableData: any[]): string {
    if (tableData.length === 0) return '';
    
    const headers = Object.keys(tableData[0]);
    const lines: string[] = [];
    
    // Header row
    lines.push('| ' + headers.join(' | ') + ' |');
    lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');
    
    // Data rows
    tableData.forEach(row => {
      const cells = headers.map(h => String(row[h] || ''));
      lines.push('| ' + cells.join(' | ') + ' |');
    });
    
    return lines.join('\n');
  }
}

// Export singleton instance
export const claraAttachmentService = new ClaraAttachmentService(); 