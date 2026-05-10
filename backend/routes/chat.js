import express from "express";

import { retrieveChunks } from "../services/retrieve.js";
import { generateAnswer } from "../services/llm.js";

const router = express.Router();

router.post("/chat", async (req, res) => {

  try {

    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const docs =
      await retrieveChunks(query);

    const answer =
      await generateAnswer(query, docs);

    res.json({
      answer,
      sources: docs.map((d) => ({
        page: d.metadata.page,
      })),
    });

  } catch (err) {

    console.error("Chat error:", err);

    res.status(500).json({
      error: "Chat failed",
    });
  }
});

export default router;