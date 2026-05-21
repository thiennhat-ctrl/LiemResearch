import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    doi: { type: String, required: true, trim: true },
    paperLink: { type: String, required: true, trim: true },
    abstract: { type: String, required: true, trim: true },
    keywords: [{ type: String, trim: true }],
    publishedYear: { type: Number, required: true },
    status: {
      type: String,
      enum: ['not_downloaded', 'downloaded', 'duplicate', 'need_info', 'failed'],
      default: 'not_downloaded',
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pdfPath: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

paperSchema.index({ doi: 1 }, { unique: true });
paperSchema.index({ paperLink: 1 }, { unique: true });
paperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });

export const Paper = mongoose.model('Paper', paperSchema);