import jwt from "jsonwebtoken";
import { KEY } from "../db/secret.js";

// expects object type like user.name, user.role
export function genToken(user) {
  try {
    if (!user.id || !user.name || !user.role) {
      console.error("User fields missing to generate token");
      return;
    }
    const token = jwt.sign(user, KEY, {
      algorithm: "HS256",
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    throw new Exception(`Exception made trying to generate token, ${error}`);
  }
}

export async function decodeToken(payload) {
  return new Promise((resolve, reject) => {
    try {
      if (!payload) reject(new Error("Payload missing"));

      jwt.verify(
        payload,
        KEY,
        {
          algorithm: "HS256",
        },
        (err, decode) => {
          if (err) reject(err);
          resolve(decode);
        }
      );
    } catch (error) {
      reject(
        new Error(`Exception made trying to decode payload: ${error?.message}`)
      );
    }
  });
}
