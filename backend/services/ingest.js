import { PDFLoader }
from "@langchain/community/document_loaders/fs/pdf";

import { QdrantClient } from "@qdrant/js-client-rest";

import { chunkDocs }
from "../utils/chunking.js";

import { getEmbedding }
from "../utils/embedding.js";

export async function ingestPDF(filePath) {

  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    timeout: 30000,
  });

  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    const splitDocs = await chunkDocs(docs);

    for (let i = 0; i < splitDocs.length; i++) {

      const doc = splitDocs[i];

      const embedding = await getEmbedding(doc.pageContent);

      const points = [
        {
          id: i,
          vector: embedding,
          payload: {
            text: doc.pageContent,
            page: doc.metadata.page || 0,
            chunkId: doc.metadata.chunkId,
          },
        },
      ];

      await client.upsert("notebooklm", {
        points: points,
        wait: true,
      });
    }

    return splitDocs;
  } catch (error) {
    console.error("Ingest error details:", error.message);
    throw error;
  }
}