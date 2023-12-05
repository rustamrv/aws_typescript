import { config } from "dotenv";
import { env } from "node:process";

config();

export const configService = { 
    get<T>(key: string): T {
        return env[key] as T
    }
}