import mongoose, { Schema, Document, Model } from 'mongoose';

// Campus Schema
export interface ICampus extends Document {
  name: string;
  code: string;
  createdAt: Date;
}

const CampusSchema = new Schema<ICampus>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const CampusModel: Model<ICampus> =
  mongoose.models.Campus || mongoose.model<ICampus>('Campus', CampusSchema);

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  campus: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  campus: { type: Schema.Types.ObjectId, ref: 'Campus', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Resource Schema
export interface IResource extends Document {
  title: string;
  category: 'Books' | 'Notes / Study Material' | 'Stationery';
  description: string;
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  image: string;
  seller: mongoose.Types.ObjectId;
  campus: mongoose.Types.ObjectId;
  status: 'Available' | 'Sold';
  createdAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Books', 'Notes / Study Material', 'Stationery'],
    required: true,
  },
  description: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 1 },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair'],
    required: true,
  },
  image: { type: String, default: '' },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  campus: { type: Schema.Types.ObjectId, ref: 'Campus', required: true },
  status: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available',
  },
  createdAt: { type: Date, default: Date.now },
});

export const ResourceModel: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

// Request Schema
export interface IRequest extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;
  price: number;
  campus: mongoose.Types.ObjectId;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
  price: { type: Number, required: true },
  campus: { type: Schema.Types.ObjectId, ref: 'Campus', required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const RequestModel: Model<IRequest> =
  mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);

// Review Schema
export interface IReview extends Document {
  seller: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;
  request: mongoose.Types.ObjectId;
  campus: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
  request: { type: Schema.Types.ObjectId, ref: 'Request', required: true, unique: true },
  campus: { type: Schema.Types.ObjectId, ref: 'Campus', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

// ReviewReport Schema
export interface IReviewReport extends Document {
  review: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  campus: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReviewReportSchema = new Schema<IReviewReport>({
  review: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: Schema.Types.ObjectId ? String : String, required: true, trim: true },
  campus: { type: Schema.Types.ObjectId, ref: 'Campus', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ReviewReportModel: Model<IReviewReport> =
  mongoose.models.ReviewReport ||
  mongoose.model<IReviewReport>('ReviewReport', ReviewReportSchema);
