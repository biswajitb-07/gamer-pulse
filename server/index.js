import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";
import path from "path";

import connectDB from "./db/db.js";
import userRouter from "./routes/user/user.routes.js";
import teamRouter from "./routes/user/team.routes.js";
import tournamentRouter from "./routes/admin/tournament.routes.js";
import playerRouter from "./routes/admin/player.routes.js";
import "./utils/passport.js";
import walletRouter from "./routes/user/wallet.routes.js";

const app = express();
const port = process.env.PORT || 5000;
const _dirname = path.resolve();

connectDB();

const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

// app.disable("x-powered-by");

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         imgSrc: ["'self'", "data:", "https:"],
//       },
//     },
//     hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
//   })
// );

// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again later.",
// });
// app.use(limiter);

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 30,
//   message: "Too many auth attempts, please try again after 15 minutes.",
// });

// app.use("/api/v1/user", authLimiter);

// app.use(mongoSanitize({ replaceWith: "_" }));
// app.use(xss());
// app.use(compression());

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser(process.env.SECRET_KEY));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
      signed: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use("/api/v1/user", userRouter);
app.use("/api/v1/team", teamRouter);
app.use("/api/v1/admin-tournament", tournamentRouter);
app.use("/api/v1/admin-user", playerRouter);
app.use("/api/v1/wallet", walletRouter);

app.use(express.static(path.join(_dirname, "/client/dist")));
app.get("*", (_, res) => {
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`✅ Server running securely on PORT: ${port}`);
});
