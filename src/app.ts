import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes"
import workspaceRoutes from "./modules/workspace/workspace.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(cookieParser());

//auth
app.use("/api/auth", authRoutes);
app.use("/api/project", workspaceRoutes);

app.get('/health', (req, res) => {
    res.send("Promanage backend is UP!!")
})

app.use(errorHandler);

export default app;
