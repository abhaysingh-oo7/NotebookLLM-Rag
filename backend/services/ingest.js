import { PDFLoader }
from "@langchain/community/document_loaders/fs/pdf";

import { readFileSync } from "fs";
import { QdrantClient } from "@qdrant/js-client-rest";

import { chunkDocs }
from "../utils/chunking.js";

import { getEmbedding }
from "../utils/embedding.js";

export async function ingestFile(filePath, originalFilename) {

  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    timeout: 30000,
  });

  try {
    const fileExtension = originalFilename.toLowerCase().split('.').pop();
    console.log("Original filename:", originalFilename);
    console.log("File extension:", fileExtension);

    let docs;

    if (fileExtension === 'pdf') {
      const loader = new PDFLoader(filePath);
      docs = await loader.load();
    } else if (fileExtension === 'txt') {
      const content = readFileSync(filePath, 'utf-8');
      docs = [
        {
          pageContent: content,
          metadata: { page: 0 }
        }
      ];
    } else {
      throw new Error(`Unsupported file type: .${fileExtension}. Only PDF and TXT are supported.`);
    }

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
