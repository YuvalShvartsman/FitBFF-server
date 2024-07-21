import Users from "../models/Users";

import { Request, Response } from "express";

import { OAuth2Client } from "google-auth-library";

import * as dotenv from "dotenv";

dotenv.config();

interface GoogleSignInRequest extends Request {
  body: {
    token: string;
  };
}

const client = new OAuth2Client(process.env.googleId);

async function Verify(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.googleId,
  });
  return ticket.getPayload();
}
export const googleSignIn = async (req: GoogleSignInRequest, res: Response) => {
  const { token } = req.body;
  try {
    const payload = await Verify(token);
    const { sub: googleId, email, name, picture } = payload;
    const user = await Users.findOne({ googleId: googleId });

    if (!user) {
      const user = await Users.create({ googleId, email, name, picture });
    } else {
      const user = await Users.updateOne(
        { googleId },
        { googleId, email, name, picture }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(401).json({ error: "unable to connect to the server" });
  }
};
