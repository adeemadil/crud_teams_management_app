import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

if (!MONGODB_URI) {
  // We avoid throwing on import in Next, but log to help configuration
  console.warn("MONGODB_URI is not set. Set it in .env.local for API routes to work.");
}

interface GlobalWithMongoose {
  mongooseConn?: typeof mongoose;
  mongoosePromise?: Promise<typeof mongoose>;
}

const globalWithMongoose = global as unknown as GlobalWithMongoose;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalWithMongoose.mongooseConn) {
    return globalWithMongoose.mongooseConn;
  }

  if (!globalWithMongoose.mongoosePromise) {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured. Create .env.local with MONGODB_URI.");
    }
    globalWithMongoose.mongoosePromise = mongoose.connect(MONGODB_URI);
  }

  globalWithMongoose.mongooseConn = await globalWithMongoose.mongoosePromise;
  return globalWithMongoose.mongooseConn;
}


