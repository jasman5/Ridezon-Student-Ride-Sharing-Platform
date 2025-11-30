import { Router } from "express";
import { signup, login, googleLogin, getProfile, logout, completeSignup } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { signupSchema, loginSchema, googleLoginSchema, logoutSchema, completeSignupSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleLoginSchema), googleLogin);

router.get("/user/profile", authenticate, getProfile);
router.post("/logout", authenticate, validate(logoutSchema), logout);
router.put("/user/register-info", authenticate, validate(completeSignupSchema), completeSignup);

export default router;
