import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

import Users from "../models/Users";

const client = new OAuth2Client(
  "20513430831-2s88uppgtrbfomn25p7ooui5qfmluv7k.apps.googleusercontent.com"
);
interface GoogleSignInRequest extends Request {
  body: {
    token: string;
  };
}

export const googleSignIn = async (req: GoogleSignInRequest, res: Response) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "20513430831-2s88uppgtrbfomn25p7ooui5qfmluv7k.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    const bla = await Users.findOne({ googleId: googleId });
    console.log(bla);
    console.log(googleId);

    if (!bla) {
      const user = await Users.create({ googleId, email, name, picture });
      /* console.log("🚀 ~ googleSignIn ~ user:", user);*/
    } else {
      const user = await Users.updateOne(
        { googleId },
        { googleId, email, name, picture }
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    /* console.log("🚀 ~ googleSignIn ~ error:", error);*/
    res.status(401).json({ error: "Invalid token" });
  }
};
