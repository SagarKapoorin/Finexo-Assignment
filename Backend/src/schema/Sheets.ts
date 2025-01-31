import mongoose, { Schema, Document } from 'mongoose';

export interface Sheets extends Document {
  sheetName: string;
  data: { [key: string]: any };
  importDate: Date;
}

const SheetsSchema: Schema = new Schema({
  sheetName: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  importDate: { type: Date, default: Date.now }
});

export default mongoose.model<Sheets>('Sheets', SheetsSchema);