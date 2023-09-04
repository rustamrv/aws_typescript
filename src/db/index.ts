import mongoose, { Schema } from "mongoose";
import { config } from "dotenv";
import { env } from "node:process";

config();

class DatabaseService {
  private static instance: DatabaseService;
  private connection: mongoose.Connection | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (!this.connection) {
      this.connection = await mongoose.createConnection(uri);
    }
  }

  public async getConnection(): Promise<mongoose.Connection> {
    if (!this.connection) {
      throw new Error("Error connect to db");
    }
    return this.connection;
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}

export const connectDb = async () => {
  const database = DatabaseService.getInstance();
  await database.connect(env.MONGODB_URI as string);

  return await database.getConnection();
};

export const createModel = async (name: string, schema: Schema) => {
  const connection = await connectDb();
  return connection.model(name, schema);
};
