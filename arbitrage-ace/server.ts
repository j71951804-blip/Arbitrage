// server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ebayRoutes } from './routes/ebay';
import { amazonRoutes } from './routes/amazon';
import { opportunityRoutes } from './routes/opportunities';
import { authRoutes } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arbitrage-ace')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ebay', ebayRoutes);
app.use('/api/amazon', amazonRoutes);
app.use('/api/opportunities', opportunityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// models/Opportunity.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IOpportunity extends Document {
  productName: string;
  ebayPrice: number;
  amazonPrice: number;
  ebayUrl: string;
  amazonUrl: string;
  imageUrl: string;
  ebaySeller: string;
  amazonSeller: string;
  fees: {
    ebay: number;
    amazon: number;
    shipping: number;
  };
  potentialProfit: number;
  roi: number;
  dateFound: Date;
  userId: string;
  status: 'active' | 'expired' | 'sold';
  ebayItemId: string;
  amazonAsin: string;
}

const opportunitySchema = new Schema<IOpportunity>({
  productName: { type: String, required: true },
  ebayPrice: { type: Number, required: true },
  amazonPrice: { type: Number, required: true },
  ebayUrl: { type: String, required: true },
  amazonUrl: { type: String, required: true },
  imageUrl: { type: String, required: true },
  ebaySeller: { type: String, required: true },
  amazonSeller: { type: String, required: true },
  fees: {
    ebay: { type: Number, required: true },
    amazon: { type: Number, required: true },
    shipping: { type: Number, required: true }
  },
  potentialProfit: { type: Number, required: true },
  roi: { type: Number, required: true },
  dateFound: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  status: { type: String, enum: ['active', 'expired', 'sold'], default: 'active' },
  ebayItemId: { type: String, required: true },
  amazonAsin: { type: String, required: true }
}, { timestamps: true });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);

// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  settings: {
    minProfit: number;
    minRoi: number;
    keywords: string[];
    notifications: boolean;
  };
  apiKeys: {
    ebay: {
      appId: string;
      certId: string;
      devId: string;
      userToken?: string;
    };
    amazon: {
      accessKey: string;
      secretKey: string;
      associateTag: string;
    };
  };
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  settings: {
    minProfit: { type: Number, default: 10 },
    minRoi: { type: Number, default: 25 },
    keywords: [{ type: String }],
    notifications: { type: Boolean, default: true }
  },
  apiKeys: {
    ebay: {
      appId: String,
      certId: String,
      devId: String,
      userToken: String
    },
    amazon: {
      accessKey: String,
      secretKey: String,
      associateTag: String
    }
  }
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
