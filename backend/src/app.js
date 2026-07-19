// src/app.js
import "dotenv/config";

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import typeDefs from "./graphql/schema/schema.js";
import resolvers from "./graphql/resolvers/resolvers.js";
import db from "./config/db.js";
import { getContext } from "./auth/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

/* ===========================
   Multer Configuration
=========================== */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/products"));
  },

  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* ===========================
   Static Images
=========================== */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

/* ===========================
   Upload Endpoint
=========================== */

app.post(
  "/upload/product-image",
  upload.single("image"),
  (req, res) => {
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    res.json({
      url: `http://localhost:4000/uploads/products/${req.file.filename}`,
    });
  }
);

/* ===========================
   Apollo Server
=========================== */

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const authContext = await getContext({ req });

      return {
        db,
        ...authContext,
      };
    },
  })
);

/* ===========================
   Start Server
=========================== */

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 GraphQL: http://localhost:4000/graphql");
  console.log("📸 Upload : http://localhost:4000/upload/product-image");
});