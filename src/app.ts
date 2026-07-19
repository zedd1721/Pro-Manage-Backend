import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes"
import inviteRoutes from "./modules/invite/invite.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());

//auth
app.use("/api/auth", authRoutes);

//invite
app.use("/api/invite", inviteRoutes);

app.get('/health', (req, res) => {
    res.send("Promanage backend is UP!!")
})

app.use(errorHandler);

export default app;
