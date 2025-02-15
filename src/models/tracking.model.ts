/**
 * Modelo Mongoose para Rastreamento
 * Define a estrutura do documento de rastreamento armazenado no MongoDB.
 */
import mongoose, { Schema, Document } from 'mongoose';

// Interface que descreve a estrutura de um documento de rastreamento
export interface ITracking extends Document {
  trackingCode: string;
  carrier: string;
  events: {
    timestamp: Date;
    status: string;
    idStatus: number;
    location: string;
  }[];
}

// Define o schema do Mongoose para rastreamento
const TrackingSchema: Schema = new Schema({
  trackingCode: { type: String, required: true, unique: true },
  carrier: { type: String, required: true },
  events: [
    {
      timestamp: { type: Date, required: true },
      status: { type: String, required: true },
      idStatus: { type: Number, required: true },
      location: { type: String, default: '' },
    },
  ],
});

// Exporta o modelo para ser utilizado na aplicação
export default mongoose.model<ITracking>('Tracking', TrackingSchema);
