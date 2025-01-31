import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, Trash2, X, FileSpreadsheet, AlertCircle } from 'lucide-react';

//WorkFlow:  
//file Upload->parse->show error or show data->delete row->import valid data->any relevant message

//TabPanel component
function TabPanel(props:{children: React.ReactNode;value: string;select: string;}) {
  const {children, value, select} = props;
//   console.log(porps);
  return (
    <div role="tabpanel" hidden={value !== select}>
      {value===select&&<div className="p-6">{children}</div>}
    </div>
  );
}
//FileImportPage component

const FileImportPage=()=> {
  const [sheets,setSheets]=useState<{[key:string]:any[]}>({});
//   console.log(sheets)
  const [errors,setErrors] = useState<{[key:string]:Array<{ row: number;message:string}>}>({});
  const [thisSheet, setthisSheet] = useState<string>('');
//   console.log(thisSheet);
  const [page,setPage]=useState(0);
  const [row_Page,setrow_Page]=useState(10);
  const [modalOpen,setModalOpen]=useState(false);//for showing error box
//   console.log(modalOpen)
  const [importResult,setImportResult]=useState<{success:boolean; message: string }|null>(null);
//   console.log(importResult)
  const [deletedRows,setDeletedRows]=useState<{[key: string]:Set<number> }>({});
  const [select,setselect]=useState<string>('');
  console.log(deletedRows)
  const onDrop=useCallback((given_Files: File[]) => {
    const file=given_Files[0];
    const reader=new FileReader();
    reader.onload=(e) => {
      const data=new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook=XLSX.read(data,{ type:'array',cellDates:true});
      const sheetData:{[key: string]:any[]}={};
    //   console.log(data);
    //   console.log(workbook);
      console.log(sheetData);
      workbook.SheetNames.forEach((s)=>{
        const worksheet=workbook.Sheets[s];
        sheetData[s]=XLSX.utils.sheet_to_json(worksheet, { raw: false });
      });
      setSheets(sheetData);
      setthisSheet(workbook.SheetNames[0]);
      backend(sheetData);
    };
    reader.readAsArrayBuffer(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 2097152,
  });
  const backend=async (data: any) => {
      console.log(data);
    const the_errors={
      'Sheet1': [{ row: 2, message: 'Invalid email format' }],
      'Sheet2': [{ row: 5, message: 'Missing required field' }]
    };
       setErrors(the_errors);
      setselect(Object.keys(the_errors)[0]);
    setModalOpen(Object.keys(the_errors).length > 0);
  };
  const delete_Row=(sheet: string,rowIndex:number) => {
    //delete row
    if (window.confirm('Are you sure you want to delete this row?')) {
       setDeletedRows(prev => ({
        ...prev,
        [sheet]: new Set([...(prev[sheet]||[]),rowIndex])
      }));
    }
  };

  const import_it =() => { //importing only non error and valid data
        const validRows=Object.entries(sheets).reduce((acc, [sheetName, rows])=>{
      acc[sheetName] = rows.filter((_, index) => 
        !deletedRows[sheetName]?.has(index) && !errors[sheetName]?.some(e => e.row === index)
      );
      return acc;
    },{}as{[key: string]: any[]});
        console.log('Importing:', validRows);
    setImportResult({ success: true, message: 'Data imported successfully' });
  };
  const formatDate = (date: Date) => date.toLocaleDateString('en-IN');
    const formatNumber = (num: number) => num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Excel Data Import</h1>
          <p className="text-gray-600">Upload your Excel file to import data into the system</p>
        </div>
    {/* //file upload section */}
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
            <p className="text-lg text-blue-600 font-medium">Drop your Excel file here</p>
          ) : (
                <div>
              <p className="text-lg text-gray-700 font-medium mb-2">
                    Drag and drop your Excel file here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse (XLSX files only, max 2MB)
              </p>
            </div>
          )}
        </div>

        {Object.keys(sheets).length>0 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <select
                    value={thisSheet}
                onChange={(e) => setthisSheet(e.target.value)}
                className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                    {Object.keys(sheets).map((sheet) => (
                  <option key={sheet} value={sheet}>{sheet}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
                {/* data show and manupilate */}
               <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                            {Object.keys(sheets[thisSheet][0]).map((header)=>(
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                    </th>
                  </tr>
                </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                  {sheets[thisSheet]
                    .slice(page * row_Page, (page + 1) * row_Page)
                        .map((row, index) => (
                      <tr 
                        key={index}
                        className={errors[thisSheet]?.some(e =>e.row === index) //error handling part
                          ? 'bg-red-50' //show red if error
                          : 'hover:bg-gray-50'}>
                        {Object.values(row).map((value,i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                 {value instanceof Date ? formatDate(value) : 
                             typeof value === 'number' ? formatNumber(value) : value as React.ReactNode}
                          </td>
                           ))}
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <button
                            onClick={() => delete_Row(thisSheet, index)}
                             className="text-red-600 hover:text-red-900"
                           >
                                     <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
                 </table>
            </div>
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center">
                <select
                  value={row_Page}
                      onChange={(e) => {
                    setrow_Page(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  className="mr-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[10, 25, 50].map((value) => (
                    <option key={value} value={value}>
                      {value} rows
                    </option>
                  ))}
                </select>
                       <span className="text-sm text-gray-700">
                  Page {page + 1} of {Math.ceil(sheets[thisSheet].length / row_Page)}
                </span>
                  </div>
              <div className="flex space-x-2">
                      <button
                  onClick={() =>setPage(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>setPage(page + 1)}
                  disabled={page>=Math.ceil(sheets[thisSheet].length / row_Page)-1}
                       className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
                <div className="p-6 border-t border-gray-200">
              <button
                    onClick={import_it}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Valid Data
              </button>
            </div>
          </div>
        )}
               {modalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  Validation Errors
                </h3>
                    <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="border-b border-gray-200">
                <div className="flex">
                        {Object.keys(errors).map((sheet) => (
                    <button
                      key={sheet}
                      onClick={() => setselect(sheet)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        select === sheet
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {sheet}
                    </button>
                  ))}
                    </div>
              </div>
              <div className="overflow-y-auto max-h-[60vh]">
                {Object.keys(errors).map((sheet) => (
                  <TabPanel key={sheet} value={sheet} select={select}>
                    {errors[sheet].map((error) => (
                             <div
                        key={`${sheet}-${error.row}`}
                        className="mb-3 p-3 bg-red-50 rounded-md"
                      >
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium text-red-800">Row {error.row + 1}</p>
                            <p className="text-red-700">{error.message}</p>
                          </div>
                        </div>
                          </div>
                    ))}
                  </TabPanel>
                ))}
              </div>
                     <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
                             {importResult && (
           <div className={`fixed bottom-4 right-4 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}>
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {importResult.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setImportResult(null)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="h-5 w-5" />
                          </button>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
    </div>
  );
};

export default FileImportPage;