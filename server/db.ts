import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  CampusModel,
  UserModel,
  ResourceModel,
  RequestModel,
  ReviewModel,
  ReviewReportModel,
  ICampus,
  IUser,
  IResource,
  IRequest,
  IReview,
  IReviewReport,
} from './models.ts';

let isConnectedToAtlas = false;
let connectionError: string | null = null;

// In-Memory store for when Atlas URI is not yet configured or unreachable
interface InMemoryDB {
  campuses: any[];
  users: any[];
  resources: any[];
  requests: any[];
  reviews: any[];
  reviewReports: any[];
}

const memoryDB: InMemoryDB = {
  campuses: [],
  users: [],
  resources: [],
  requests: [],
  reviews: [],
  reviewReports: [],
};

// Seed demo data for instant evaluation if memoryDB is empty
export async function seedInitialCampus() {
  const existingCampuses = isConnectedToAtlas
    ? await CampusModel.find({})
    : memoryDB.campuses;

  if (existingCampuses.length === 0) {
    console.log('[SmartCampus] No campus found. Awaiting one-time setup or demo initialization.');
  }
}

export async function connectDB(): Promise<{ isAtlas: boolean; error?: string }> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('cluster0.abcde.mongodb.net') || uri.includes('<username>')) {
    console.log('[SmartCampus] No valid MONGODB_URI found. Operating in local in-memory MongoDB-compatible mode.');
    isConnectedToAtlas = false;
    return { isAtlas: false };
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnectedToAtlas = true;
    connectionError = null;
    console.log('[SmartCampus] Successfully connected to MongoDB Atlas!');
    return { isAtlas: true };
  } catch (err: any) {
    console.error('[SmartCampus] MongoDB Atlas connection failed:', err.message);
    isConnectedToAtlas = false;
    connectionError = err.message;
    console.log('[SmartCampus] Falling back to local in-memory storage.');
    return { isAtlas: false, error: err.message };
  }
}

export function getDBStatus() {
  return {
    isAtlas: isConnectedToAtlas,
    error: connectionError,
    mongooseReadyState: mongoose.connection.readyState,
  };
}

// Unified repository methods that use Mongoose when connected or memoryDB as fallback
function generateId(): string {
  return new mongoose.Types.ObjectId().toString();
}

export const db = {
  isAtlas: () => isConnectedToAtlas,

  // CAMPUS
  campus: {
    findFirst: async (): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return CampusModel.findOne().lean();
      }
      return memoryDB.campuses[0] || null;
    },
    findByCode: async (code: string): Promise<any | null> => {
      const upper = code.trim().toUpperCase();
      if (isConnectedToAtlas) {
        return CampusModel.findOne({ code: upper }).lean();
      }
      return memoryDB.campuses.find((c) => c.code.toUpperCase() === upper) || null;
    },
    findById: async (id: string): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return CampusModel.findById(id).lean();
      }
      return memoryDB.campuses.find((c) => c._id.toString() === id.toString()) || null;
    },
    create: async (data: { name: string; code: string }): Promise<any> => {
      if (isConnectedToAtlas) {
        const campus = await CampusModel.create({
          name: data.name.trim(),
          code: data.code.trim().toUpperCase(),
        });
        return campus.toObject();
      }
      const newCampus = {
        _id: generateId(),
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        createdAt: new Date(),
      };
      memoryDB.campuses.push(newCampus);
      return newCampus;
    },
  },

  // USERS
  user: {
    findByEmail: async (email: string): Promise<any | null> => {
      const clean = email.toLowerCase().trim();
      if (isConnectedToAtlas) {
        return UserModel.findOne({ email: clean }).lean();
      }
      return memoryDB.users.find((u) => u.email.toLowerCase() === clean) || null;
    },
    findById: async (id: string): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return UserModel.findById(id).lean();
      }
      return memoryDB.users.find((u) => u._id.toString() === id.toString()) || null;
    },
    create: async (data: {
      name: string;
      email: string;
      passwordHash: string;
      campusId: string;
      avatar?: string;
    }): Promise<any> => {
      if (isConnectedToAtlas) {
        const user = await UserModel.create({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password: data.passwordHash,
          campus: new mongoose.Types.ObjectId(data.campusId),
          avatar: data.avatar || '',
        });
        return user.toObject();
      }
      const newUser = {
        _id: generateId(),
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.passwordHash,
        campus: data.campusId,
        avatar: data.avatar || '',
        createdAt: new Date(),
      };
      memoryDB.users.push(newUser);
      return newUser;
    },
    updateAvatar: async (userId: string, avatar: string): Promise<any> => {
      if (isConnectedToAtlas) {
        return UserModel.findByIdAndUpdate(userId, { avatar }, { new: true }).lean();
      }
      const user = memoryDB.users.find((u) => u._id.toString() === userId.toString());
      if (user) {
        user.avatar = avatar;
      }
      return user;
    },
  },

  // RESOURCES
  resource: {
    findMany: async (filter: {
      campusId: string;
      category?: string;
      condition?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      sellerId?: string;
    }): Promise<any[]> => {
      if (isConnectedToAtlas) {
        const query: any = { campus: filter.campusId };
        if (filter.category) query.category = filter.category;
        if (filter.condition) query.condition = filter.condition;
        if (filter.sellerId) query.seller = filter.sellerId;
        if (filter.search) {
          query.$or = [
            { title: { $regex: filter.search, $options: 'i' } },
            { description: { $regex: filter.search, $options: 'i' } },
          ];
        }
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
          query.price = {};
          if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
          if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
        }

        const resources = await ResourceModel.find(query)
          .populate('seller', 'name avatar')
          .sort({ createdAt: -1 })
          .lean();
        return resources;
      }

      let list = memoryDB.resources.filter(
        (r) => r.campus.toString() === filter.campusId.toString()
      );

      if (filter.sellerId) {
        list = list.filter((r) => r.seller.toString() === filter.sellerId?.toString());
      }
      if (filter.category) {
        list = list.filter((r) => r.category === filter.category);
      }
      if (filter.condition) {
        list = list.filter((r) => r.condition === filter.condition);
      }
      if (filter.minPrice !== undefined) {
        list = list.filter((r) => r.price >= (filter.minPrice || 0));
      }
      if (filter.maxPrice !== undefined) {
        list = list.filter((r) => r.price <= (filter.maxPrice || Infinity));
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)
        );
      }

      // Populate seller
      return list
        .map((r) => {
          const sellerObj = memoryDB.users.find(
            (u) => u._id.toString() === r.seller.toString()
          );
          return {
            ...r,
            seller: sellerObj
              ? { _id: sellerObj._id, name: sellerObj.name, avatar: sellerObj.avatar }
              : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    findById: async (id: string): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return ResourceModel.findById(id).populate('seller', 'name avatar createdAt').lean();
      }
      const r = memoryDB.resources.find((item) => item._id.toString() === id.toString());
      if (!r) return null;
      const sellerObj = memoryDB.users.find((u) => u._id.toString() === r.seller.toString());
      return {
        ...r,
        seller: sellerObj
          ? {
              _id: sellerObj._id,
              name: sellerObj.name,
              avatar: sellerObj.avatar,
              createdAt: sellerObj.createdAt,
            }
          : null,
      };
    },

    create: async (data: {
      title: string;
      category: 'Books' | 'Notes / Study Material' | 'Stationery';
      description: string;
      price: number;
      condition: 'New' | 'Like New' | 'Good' | 'Fair';
      image: string;
      sellerId: string;
      campusId: string;
    }): Promise<any> => {
      if (isConnectedToAtlas) {
        const doc = await ResourceModel.create({
          title: data.title.trim(),
          category: data.category,
          description: data.description.trim(),
          price: data.price,
          condition: data.condition,
          image: data.image,
          seller: new mongoose.Types.ObjectId(data.sellerId),
          campus: new mongoose.Types.ObjectId(data.campusId),
          status: 'Available',
        });
        return doc.toObject();
      }

      const newResource = {
        _id: generateId(),
        title: data.title.trim(),
        category: data.category,
        description: data.description.trim(),
        price: data.price,
        condition: data.condition,
        image: data.image,
        seller: data.sellerId,
        campus: data.campusId,
        status: 'Available',
        createdAt: new Date(),
      };
      memoryDB.resources.push(newResource);
      return newResource;
    },

    update: async (
      id: string,
      data: Partial<{
        title: string;
        category: 'Books' | 'Notes / Study Material' | 'Stationery';
        description: string;
        price: number;
        condition: 'New' | 'Like New' | 'Good' | 'Fair';
        image: string;
        status: 'Available' | 'Sold';
      }>
    ): Promise<any> => {
      if (isConnectedToAtlas) {
        return ResourceModel.findByIdAndUpdate(id, data, { new: true }).lean();
      }
      const item = memoryDB.resources.find((r) => r._id.toString() === id.toString());
      if (item) {
        Object.assign(item, data);
      }
      return item;
    },

    delete: async (id: string): Promise<boolean> => {
      if (isConnectedToAtlas) {
        const res = await ResourceModel.findByIdAndDelete(id);
        return !!res;
      }
      const index = memoryDB.resources.findIndex((r) => r._id.toString() === id.toString());
      if (index !== -1) {
        memoryDB.resources.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  // REQUESTS
  request: {
    create: async (data: {
      buyerId: string;
      sellerId: string;
      resourceId: string;
      price: number;
      campusId: string;
    }): Promise<any> => {
      if (isConnectedToAtlas) {
        const doc = await RequestModel.create({
          buyer: new mongoose.Types.ObjectId(data.buyerId),
          seller: new mongoose.Types.ObjectId(data.sellerId),
          resource: new mongoose.Types.ObjectId(data.resourceId),
          price: data.price,
          campus: new mongoose.Types.ObjectId(data.campusId),
          status: 'Pending',
        });
        return doc.toObject();
      }
      const reqDoc = {
        _id: generateId(),
        buyer: data.buyerId,
        seller: data.sellerId,
        resource: data.resourceId,
        price: data.price,
        campus: data.campusId,
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryDB.requests.push(reqDoc);
      return reqDoc;
    },

    findExistingPending: async (buyerId: string, resourceId: string): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return RequestModel.findOne({
          buyer: buyerId,
          resource: resourceId,
          status: 'Pending',
        }).lean();
      }
      return (
        memoryDB.requests.find(
          (r) =>
            r.buyer.toString() === buyerId.toString() &&
            r.resource.toString() === resourceId.toString() &&
            r.status === 'Pending'
        ) || null
      );
    },

    findById: async (id: string): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return RequestModel.findById(id).lean();
      }
      return memoryDB.requests.find((r) => r._id.toString() === id.toString()) || null;
    },

    findBySeller: async (sellerId: string): Promise<any[]> => {
      if (isConnectedToAtlas) {
        return RequestModel.find({ seller: sellerId })
          .populate('buyer', 'name avatar')
          .populate('resource', 'title image category price status')
          .sort({ createdAt: -1 })
          .lean();
      }
      return memoryDB.requests
        .filter((r) => r.seller.toString() === sellerId.toString())
        .map((r) => {
          const buyer = memoryDB.users.find((u) => u._id.toString() === r.buyer.toString());
          const resource = memoryDB.resources.find(
            (res) => res._id.toString() === r.resource.toString()
          );
          return {
            ...r,
            buyer: buyer ? { _id: buyer._id, name: buyer.name, avatar: buyer.avatar } : null,
            resource: resource
              ? {
                  _id: resource._id,
                  title: resource.title,
                  image: resource.image,
                  category: resource.category,
                  price: resource.price,
                  status: resource.status,
                }
              : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    findByBuyer: async (buyerId: string): Promise<any[]> => {
      if (isConnectedToAtlas) {
        const list = await RequestModel.find({ buyer: buyerId })
          .populate('seller', 'name email avatar')
          .populate('resource', 'title image category price status')
          .sort({ createdAt: -1 })
          .lean();

        // Omit seller email unless Accepted or Completed
        return list.map((r: any) => {
          const isAcceptedOrDone = r.status === 'Accepted' || r.status === 'Completed';
          return {
            ...r,
            seller: r.seller
              ? {
                  _id: r.seller._id,
                  name: r.seller.name,
                  avatar: r.seller.avatar,
                  email: isAcceptedOrDone ? r.seller.email : undefined,
                }
              : null,
          };
        });
      }

      return memoryDB.requests
        .filter((r) => r.buyer.toString() === buyerId.toString())
        .map((r) => {
          const seller = memoryDB.users.find((u) => u._id.toString() === r.seller.toString());
          const resource = memoryDB.resources.find(
            (res) => res._id.toString() === r.resource.toString()
          );
          const isAcceptedOrDone = r.status === 'Accepted' || r.status === 'Completed';
          return {
            ...r,
            seller: seller
              ? {
                  _id: seller._id,
                  name: seller.name,
                  avatar: seller.avatar,
                  email: isAcceptedOrDone ? seller.email : undefined,
                }
              : null,
            resource: resource
              ? {
                  _id: resource._id,
                  title: resource.title,
                  image: resource.image,
                  category: resource.category,
                  price: resource.price,
                  status: resource.status,
                }
              : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    acceptRequest: async (requestId: string, resourceId: string): Promise<void> => {
      if (isConnectedToAtlas) {
        // 1. Mark accepted request
        await RequestModel.findByIdAndUpdate(requestId, {
          status: 'Accepted',
          updatedAt: new Date(),
        });
        // 2. Mark resource as Sold
        await ResourceModel.findByIdAndUpdate(resourceId, { status: 'Sold' });
        // 3. Mark all other pending requests for this resource as Rejected
        await RequestModel.updateMany(
          {
            resource: resourceId,
            _id: { $ne: requestId },
            status: 'Pending',
          },
          {
            status: 'Rejected',
            updatedAt: new Date(),
          }
        );
        return;
      }

      // Memory implementation
      const targetReq = memoryDB.requests.find((r) => r._id.toString() === requestId.toString());
      if (targetReq) {
        targetReq.status = 'Accepted';
        targetReq.updatedAt = new Date();
      }

      const resObj = memoryDB.resources.find((r) => r._id.toString() === resourceId.toString());
      if (resObj) {
        resObj.status = 'Sold';
      }

      memoryDB.requests.forEach((r) => {
        if (
          r.resource.toString() === resourceId.toString() &&
          r._id.toString() !== requestId.toString() &&
          r.status === 'Pending'
        ) {
          r.status = 'Rejected';
          r.updatedAt = new Date();
        }
      });
    },

    rejectRequest: async (requestId: string): Promise<void> => {
      if (isConnectedToAtlas) {
        await RequestModel.findByIdAndUpdate(requestId, {
          status: 'Rejected',
          updatedAt: new Date(),
        });
        return;
      }
      const target = memoryDB.requests.find((r) => r._id.toString() === requestId.toString());
      if (target) {
        target.status = 'Rejected';
        target.updatedAt = new Date();
      }
    },

    completeRequest: async (requestId: string): Promise<void> => {
      if (isConnectedToAtlas) {
        await RequestModel.findByIdAndUpdate(requestId, {
          status: 'Completed',
          updatedAt: new Date(),
        });
        return;
      }
      const target = memoryDB.requests.find((r) => r._id.toString() === requestId.toString());
      if (target) {
        target.status = 'Completed';
        target.updatedAt = new Date();
      }
    },
  },

  // REVIEWS
  review: {
    create: async (data: {
      sellerId: string;
      buyerId: string;
      resourceId: string;
      requestId: string;
      rating: number;
      comment: string;
      campusId: string;
    }): Promise<any> => {
      if (isConnectedToAtlas) {
        const doc = await ReviewModel.create({
          seller: new mongoose.Types.ObjectId(data.sellerId),
          buyer: new mongoose.Types.ObjectId(data.buyerId),
          resource: new mongoose.Types.ObjectId(data.resourceId),
          request: new mongoose.Types.ObjectId(data.requestId),
          campus: new mongoose.Types.ObjectId(data.campusId),
          rating: data.rating,
          comment: data.comment.trim(),
        });
        return doc.toObject();
      }
      const rev = {
        _id: generateId(),
        seller: data.sellerId,
        buyer: data.buyerId,
        resource: data.resourceId,
        request: data.requestId,
        campus: data.campusId,
        rating: data.rating,
        comment: data.comment.trim(),
        createdAt: new Date(),
      };
      memoryDB.reviews.push(rev);
      return rev;
    },

    findByRequest: async (requestId: string): Promise<any | null> => {
      if (isConnectedToAtlas) {
        return ReviewModel.findOne({ request: requestId }).lean();
      }
      return (
        memoryDB.reviews.find((r) => r.request.toString() === requestId.toString()) || null
      );
    },

    findBySeller: async (sellerId: string): Promise<any[]> => {
      if (isConnectedToAtlas) {
        return ReviewModel.find({ seller: sellerId })
          .populate('buyer', 'name avatar')
          .populate('resource', 'title')
          .sort({ createdAt: -1 })
          .lean();
      }
      return memoryDB.reviews
        .filter((r) => r.seller.toString() === sellerId.toString())
        .map((r) => {
          const buyer = memoryDB.users.find((u) => u._id.toString() === r.buyer.toString());
          const resource = memoryDB.resources.find(
            (res) => res._id.toString() === r.resource.toString()
          );
          return {
            ...r,
            buyer: buyer ? { _id: buyer._id, name: buyer.name, avatar: buyer.avatar } : null,
            resource: resource ? { _id: resource._id, title: resource.title } : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getSellerStats: async (sellerId: string): Promise<{ average: number; count: number }> => {
      let sellerReviews: any[] = [];
      if (isConnectedToAtlas) {
        sellerReviews = await ReviewModel.find({ seller: sellerId }).lean();
      } else {
        sellerReviews = memoryDB.reviews.filter(
          (r) => r.seller.toString() === sellerId.toString()
        );
      }
      if (sellerReviews.length === 0) {
        return { average: 0, count: 0 };
      }
      const sum = sellerReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      const avg = Number((sum / sellerReviews.length).toFixed(1));
      return { average: avg, count: sellerReviews.length };
    },
  },

  // REVIEW REPORTS
  report: {
    create: async (data: {
      reviewId: string;
      reportedById: string;
      reason: string;
      campusId: string;
    }): Promise<any> => {
      if (isConnectedToAtlas) {
        const doc = await ReviewReportModel.create({
          review: new mongoose.Types.ObjectId(data.reviewId),
          reportedBy: new mongoose.Types.ObjectId(data.reportedById),
          reason: data.reason.trim(),
          campus: new mongoose.Types.ObjectId(data.campusId),
        });
        return doc.toObject();
      }
      const report = {
        _id: generateId(),
        review: data.reviewId,
        reportedBy: data.reportedById,
        reason: data.reason.trim(),
        campus: data.campusId,
        createdAt: new Date(),
      };
      memoryDB.reviewReports.push(report);
      return report;
    },
  },
};
