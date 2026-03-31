    import express from "express";
    import cors from "cors";
    import morgan from "morgan";
    import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

    const app = express();

    app.use(cors({ origin: process.env.CLIENT_URL?.split(",") || "*" }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));

    app.get("/health", (_req, res) => {
      res.json({ ok: true, service: process.env.npm_package_name || "service" });
    });

    app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

    export default app;
