import { RecursiveCharacterTextSplitter }
from "@langchain/textsplitters";

export async function chunkDocs(docs) {

  const splitter =
    new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

  const splitDocs =
    await splitter.splitDocuments(docs);

  splitDocs.forEach((doc, index) => {
    doc.metadata.chunkId = index;
  });

  return splitDocs;
}