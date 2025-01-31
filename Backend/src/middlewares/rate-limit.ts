import { NextFunction, Request, Response } from "express";
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.redisUrl || "redis://127.0.0.1:6379";
export const client = createClient({
  url: redisUrl,
});

client.on("error", (err: Error) => console.error("Redis Client Error", err));

async function connectRedis() {
  try {
    await client.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Could not connect to Redis", err);
  }
}

connectRedis();

export const rateLimit = async(req:Request, res:Response, next:NextFunction) => {
    const key =(req.headers['x-forwarded-for'] || req.connection.remoteAddress)?.slice(0,9) as string;
    const requests = await client.incr(key);
    //60 requests in 60 seconds limit
    if(requests === 1){
        client.expire(key,60);
    }
    if(requests>60){
    const ttl= await client.ttl(key);
    //getting time to live of key
     res.status(429).send("Too many requests, please try again in "+ttl+" seconds");
     return;
    }else{
        next();
    }

}