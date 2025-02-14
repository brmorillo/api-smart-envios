import mongoose, { Schema, Document } from 'mongoose';

export interface ITracking extends Document {
  trackingCode: string;
  carrier: string;
  events: {
    timestamp: Date;
    status: string;
    location: string;
  }[];
}

const TrackingSchema: Schema = new Schema({
  trackingCode: { type: String, required: true, unique: true },
  carrier: { type: String, required: true },
  events: [
    {
      timestamp: { type: Date, required: true },
      status: { type: String, required: true },
      location: { type: String, default: '' },
    },
  ],
});

export default mongoose.model<ITracking>('Tracking', TrackingSchema);
