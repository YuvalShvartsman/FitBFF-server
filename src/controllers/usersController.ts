import Users from "../models/Users";

import { Request, Response } from "express";

import { OAuth2Client } from "google-auth-library";

import * as dotenv from "dotenv";

import jwt from "jsonwebtoken";

dotenv.config();

const client = new OAuth2Client(process.env.googleId);
const secretKey = process.env.JWT_SECRET;

async function Verify(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

const generateToken = (user: any) => {
  return jwt.sign(
    {
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    secretKey,
    {
      expiresIn: "1h",
    }
  );
};

export const googleSignIn = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const payload = await Verify(token);
    const { sub: googleId, email, name, picture } = payload;

    let user = await Users.findOne({ googleId });
    if (!user) {
      user = await Users.create({ googleId, email, name, picture });
    } else {
      const user = await Users.updateOne(
        { googleId },
        { googleId, email, name, picture }
      );
    }

    const jwtToken = generateToken(user);

    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: false, // when we make the app on https we need to change to true
      sameSite: "strict",
      expires: new Date(Date.now() + 3600000),
    });

    res.status(200).json({ token: jwtToken, user });
  } catch (error) {
    res.status(401).json({ error: "Unable to connect to the server" });
  }
};
