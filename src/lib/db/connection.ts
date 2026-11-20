import mongoose from "mongoose";
import { createLogger } from "@/lib/logger";

const log = createLogger("db");

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    log.debug("MongoDB connected successfully");
  } catch (e: unknown) {
    cached.promise = null;
    const errType = e instanceof Error ? e.name : "UnknownError";
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    log.error("connection failed", { errorType: errType, errorMessage });
    throw e;
  }

  return cached.conn;
}
