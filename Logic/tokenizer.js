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
    throw new Exception(
      `Exception made trying to generate token, ${error}`
    );
  }
}

export function decodeToken(payload) {
  try {
    if (!payload) {
      console.error("Payload missing");
      return;
    }

    jwt.verify(
      payload,
      KEY,
      {
        algorithm: "HS256",
      },
      (err, decode) => {
        if (err) throw err;
        return decode;
      }
    );
  } catch (error) {
    throw new Exception(
      `Exception made trying to decode payload: ${error}`
    );
  }
}
