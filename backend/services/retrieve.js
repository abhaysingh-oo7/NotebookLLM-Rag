import { QdrantClient } from "@qdrant/js-client-rest";
import { getEmbedding } from "../utils/embedding.js";

export async function retrieveChunks(query) {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const queryEmbedding = await getEmbedding(query);

  const results = await client.search("notebooklm", {
    vector: queryEmbedding,
    limit: 4,
  });

  const docs = results.map((result) => ({
    pageContent: result.payload.text,
    metadata: {
      page: result.payload.page,
      chunkId: result.payload.chunkId,
    },
  }));

  return docs;
}