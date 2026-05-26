'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Deterministic 128-dimension local text embedding generator
function generateLocalEmbedding(text: string): number[] {
  const dimensions = 128;
  const vec = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const index = (charCode * (i + 13)) % dimensions;
      vec[index] += 1;
    }
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return vec;
  return vec.map(v => v / magnitude);
}

// Cosine similarity between two vectors
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Chunk text into overlapping segments
function chunkText(text: string, chunkSize: number = 400, overlap: number = 100): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.substring(i, i + chunkSize);
    chunks.push(chunk.trim());
    i += (chunkSize - overlap);
  }
  return chunks.filter(c => c.length > 10);
}

// 1. Upload a Document and chunk it
export async function uploadDocument(title: string, content: string) {
  try {
    const doc = await prisma.document.create({
      data: { title, content }
    });

    const chunks = chunkText(content);
    
    // Create chunks with embeddings
    const chunkData = chunks.map(chunk => {
      const embedding = generateLocalEmbedding(chunk);
      return {
        documentId: doc.id,
        content: chunk,
        embedding: embedding as any // Cast to any to store as Json
      };
    });

    // Bulk insert chunks
    await prisma.documentChunk.createMany({
      data: chunkData
    });

    revalidatePath("/teacher");
    return { success: true, docId: doc.id };
  } catch (err) {
    console.error("Failed to upload document:", err);
    throw new Error("Failed to upload document");
  }
}

// 2. Search similar chunks for RAG context
export async function searchSimilarChunks(query: string, limit: number = 3) {
  try {
    const queryVector = generateLocalEmbedding(query);
    
    // Fetch all chunks
    const allChunks = await prisma.documentChunk.findMany({
      include: { document: { select: { title: true } } }
    });

    const results = allChunks.map(chunk => {
      const chunkVector = chunk.embedding as number[];
      const similarity = calculateCosineSimilarity(queryVector, chunkVector || []);
      return {
        content: chunk.content,
        documentTitle: chunk.document.title,
        similarity
      };
    });

    // Sort by similarity descending and return top matches
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (err) {
    console.error("RAG search failed:", err);
    return [];
  }
}

// 3. Get all uploaded documents
export async function getDocumentsList() {
  return prisma.document.findMany({
    include: {
      _count: {
        select: { chunks: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// 4. Delete a document
export async function deleteDocument(id: string) {
  await prisma.document.delete({
    where: { id }
  });
  revalidatePath("/teacher");
  return { success: true };
}
