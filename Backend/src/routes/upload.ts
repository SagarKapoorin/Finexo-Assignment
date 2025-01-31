import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import { ExcelValidator } from '../helper/validater.js';
import { excelConfig, SheetConfig } from '../types/index.js';
import Sheets from '../schema/Sheets.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
      return;
    }

    const validator = new ExcelValidator();
    const errors = await validator.validateFile(req.file.path, excelConfig);
    console.log(errors);
    if (errors.length > 0) {
      res.status(200).json({
        success: false,
        message: 'Validation errors occurred',
        errors1:errors,
      });
      return;
    }

    const importResult = await importValidData(req.file.path, excelConfig);
    console.log(importResult);
    res.json({
      success: true,
      message: 'File imported successfully',
      ...importResult,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
});

// Define the Record type
interface RecordData {
  sheetName: string;
  data: { [key: string]: any };
}

const importValidData = async (filePath: string, configs: { [sheetName: string]: SheetConfig }) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  let totalRows = 0;
  let importedRows = 0;

  for (const sheet of workbook.worksheets) {
    const config = configs[sheet.name];
    if (!config){ console.log("no config found");continue;}

    // Map column names to their actual indexes
    const headerRow = sheet.getRow(1);
    const columnMap: { [dbField: string]: number } = {};

    Object.entries(config.columnMap).forEach(([excelCol, dbField]) => {
      const colIndex = (headerRow.values as unknown[]).indexOf(excelCol);
      if (typeof colIndex === 'number' && colIndex > 0) {
        columnMap[dbField] = colIndex;
      }
    });

    const records: RecordData[] = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = mapRowData(row, columnMap);
      records.push({
        sheetName: sheet.name,
        data: rowData,
      });

      totalRows++;
    });

    if(records.length > 0) {
      importedRows += records.length;
    }
  }

  return { totalRows, importedRows };
};

const mapRowData = (row: ExcelJS.Row, columnMap: { [dbField: string]: number }) => {
  const mappedData: { [key: string]: any } = {};

  Object.entries(columnMap).forEach(([dbField, colIndex]) => {
    mappedData[dbField] = row.getCell(colIndex).value;
  });

  return mappedData;
};
router.post("/import",async(req,res)=>{
    try {
        const requestData = req.body;
        const importDate = new Date();
    
        const sheetsToInsert = Object.entries(requestData).map(([sheetName, data]) => ({
          sheetName,
          data,
          importDate,
        }));
    
        await Sheets.insertMany(sheetsToInsert);
        
        res.status(201).json({success:true, message: 'Sheets imported successfully' });
      } catch (error) {
        console.error('Error importing sheets:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
})

export default router;
