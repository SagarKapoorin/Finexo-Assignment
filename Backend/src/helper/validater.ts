import ExcelJS from 'exceljs';
import { SheetConfig,ValidationError } from '../types/index.js';
import { dateUtils } from './dateutils.js';
const isWithinCurrentMonth = dateUtils.isWithinCurrentMonth;
export class ExcelValidator {
  async validateFile(filePath: string, sheetConfigs: { [sheetName: string]: SheetConfig }): Promise<ValidationError[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const errors: ValidationError[] = [];
    
    workbook.worksheets.forEach(sheet => {
      const config = sheetConfigs[sheet.name];
      if (!config) return;

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        
        const rowData = this.mapRowData(row, config.columnMap);
        // console.log("row data");
        // console.log(rowData);
        this.validateRow(rowData, config.validations, sheet.name, rowNumber, errors);
      });
    });

    return errors;
  }

  private mapRowData(row: ExcelJS.Row, columnMap: { [excelCol: string]: string }) {
    const map: { [key: string]: string } = {
        "Name": "A",
        "Amount": "B",
        "Date": "C",
        "Verified": "D",
        "Invoice Date": "A",
        "Receipt Date": "B",
        "Total": "C"
    };
    return Object.entries(columnMap).reduce((acc, [excelCol, dbField]) => {
        // console.log(cell);
      const cell = row.getCell(map[excelCol] as string);
    //   console.log("////////");
    //     console.log(cell.value);
    //     console.log("////////")
      acc[dbField] = cell.value;
      return acc;
    }, {} as { [key: string]: any });
  }

  private validateRow(
    rowData: { [key: string]: any },
    validations: SheetConfig['validations'],
    sheetName: string,
    rowNumber: number,
    errors: ValidationError[]
  ) {
    // Required fields validation
    validations.required?.forEach(field => {
        // console.log(field);
        // console.log(rowData[field]);
        
      if (!rowData[field]) {
        errors.push(this.createError(sheetName, rowNumber, field, 'is required'));
      }
    });

    // Date validation
    if (validations.dateFormat) {
      Object.entries(rowData).forEach(([field, value]) => {
        if (value instanceof Date) {
          if (validations.dateRange === 'current-month' && !isWithinCurrentMonth(value)) {
            errors.push(this.createError(sheetName, rowNumber, field, 'must be in current month'));
          }
        }
      });
    }

    // Number validation
    if (validations.numberRange) {
      Object.entries(rowData).forEach(([field, value]) => {
        if (typeof value === 'number') {
          if (validations.numberRange && validations.numberRange.min !== undefined && value < validations.numberRange.min) {
            errors.push(this.createError(sheetName, rowNumber, field, 
              `must be at least ${validations.numberRange.min}`));
          }
          if (validations.numberRange && validations.numberRange.max !== undefined && value > validations.numberRange.max) {
            errors.push(this.createError(sheetName, rowNumber, field, 
              `must be at most ${validations.numberRange.max}`));
          }
        }
      });
    }

    // Allowed values validation
    Object.entries(validations.allowedValues || {}).forEach(([field, allowed]) => {
      if (rowData[field] && !allowed.includes(rowData[field])) {
        errors.push(this.createError(sheetName, rowNumber, field, 
          `must be one of: ${allowed.join(', ')}`));
      }
    });
  }

  private createError(sheet: string, row: number, field: string, message: string): ValidationError {
    return {
      sheet,
      row,
      field,
      message: `${field} ${message}`
    };
  }
}