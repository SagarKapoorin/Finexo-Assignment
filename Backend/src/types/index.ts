export interface SheetConfig {
    columnMap: { [excelCol: string]: string };
    validations: {
      required?: string[];
      dateFormat?: string;
      dateRange?: 'current-month' | 'any';
      numberRange?: { min?: number; max?: number };
      allowedValues?: { [field: string]: any[] };
    };
  }
  
  export interface ValidationError {
    sheet: string;
    row: number;
    field: string;
    message: string;
  }
  
  export interface ImportResult {
    success: boolean;
    totalRows: number;
    importedRows: number;
    errors: ValidationError[];
  }

export const excelConfig: { [sheetName: string]: SheetConfig } = {
  'Default Sheet': {
    columnMap: {
      'Name': 'name',
      'Amount': 'amount',
      'Date': 'date',
      'Verified': 'verified'
    },
    validations: {
      required: ['name', 'date', 'amount'],
      dateFormat: 'DD-MM-YYYY',
      dateRange: 'current-month',
      numberRange: { min: 0.01 },
      allowedValues: {
        'verified': ['Yes', 'No']
      }
    }
  },
  'Historical Sheet': {
    columnMap: {
      'Invoice Date': 'invoiceDate',
      'Receipt Date': 'receiptDate',
      'Total': 'total'
    },
    validations: {
      required: ['invoiceDate', 'total'],
      dateRange: 'any',
      numberRange: { min: 0 }
    }
  }
};