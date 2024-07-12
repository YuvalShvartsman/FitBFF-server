import express from "express";
import { googleSignIn } from "../controllers/usersController";

const router = express.Router();

router.post("/google-signIn", googleSignIn);

export { router as usersRouter };
