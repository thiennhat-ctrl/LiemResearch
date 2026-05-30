import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { paperRouter } from "../modules/papers/paper.routes.js";
import { syncRouter } from "../modules/api-sync/sync.routes.js";

export const apiRouter: Router = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/papers", paperRouter);
apiRouter.use("/admin", syncRouter);

// More routers will be mounted here as modules land:
//   apiRouter.use("/search", searchRouter);
//   apiRouter.use("/trends", trendRouter);
//   apiRouter.use("/reports", reportRouter);
//   apiRouter.use("/bookmarks", bookmarkRouter);
