import {authenticateJWT} from "../middleware/authMiddleware";
import {createToken, deleteToken, getTokens} from "../controllers/tokenController";
import {Router} from "express";

const router = Router();

router.post("/create", authenticateJWT, createToken);
router.get("/all", authenticateJWT, getTokens);
router.delete("/:id", authenticateJWT, deleteToken);

export default router;
