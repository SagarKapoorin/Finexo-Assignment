import { SheetConfig } from "../types/index.js";

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