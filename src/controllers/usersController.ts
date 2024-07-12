import { Request, Response } from "express";

import Users from "../models/Users";

interface GoogleSignInRequest extends Request {
  body: {
    token: string;
  };
}

export const googleSignIn = async (req: GoogleSignInRequest, res: Response) => {
  const { token } = req.body;
  const users = Users.find();
  console.log(token);
};
