import express from "express";
import cors from "cors";
import { log } from "node:console";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.send("Promanage backend is UP!!")
})

export default app;
