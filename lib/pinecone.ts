import { Pinecone , PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

interface PDFDocument {
  pageContent: string;
  metadata: {
    pageNumber: number;
    fileKey: string;
    text: string;
  };
}

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export const getPineconeClient = (): Pinecone => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
  });
};

export async function loadS3IntoPinecone(fileKey: string): Promise<Document[]> {
  console.log("Downloading S3 file into file system...");
  const fileName = await downloadFromS3(fileKey);
  
  if (!fileName) {
    throw new Error("Could not download from S3");
  }

  console.log(`Loading PDF into memory: ${fileName}`);
  const loader = new PDFLoader(fileName);
  const pages = (await loader.load()) as PDFPage[];

  console.log(`Total pages in PDF: ${pages.length}`);
  const documents = await Promise.all(
    pages.map(page => prepareDocument(page, fileKey))
  );

  if (documents.flat().length === 0) {
    throw new Error("No documents generated after splitting.");
  }

  console.log("Vectorizing documents...");
  const vectors = await Promise.all(
    documents.flat().map(doc => embedDocument(doc as PDFDocument))
  );

  if (vectors.length === 0) {
    throw new Error("No vectors were created after embedding.");
  }

  console.log("Connecting to Pinecone...");
  const client = getPineconeClient();
  const pineconeIndex = client.index("genius");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("Inserting vectors into Pinecone...");
  await namespace.upsert(vectors);

  return documents.flat();
}

const embedDocument = async (pdfDoc: PDFDocument): Promise<PineconeRecord> => {
  try {
    const embeddings = await getEmbeddings(pdfDoc.pageContent);
    
    const pineconeMetadata = {
      text: truncateStringByBytes(pdfDoc.pageContent, 36000),
      pageNumber: pdfDoc.metadata.pageNumber,
      fileKey: pdfDoc.metadata.fileKey
    };

    return {
      id: md5(`${pdfDoc.pageContent}-${Date.now()}`),
      values: embeddings,
      metadata: pineconeMetadata,
    };
  } catch (error) {
    console.error("Error embedding document:", error);
    throw new Error("Embedding failed");
  }
};

const truncateStringByBytes = (str: string, bytes: number): string => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

const prepareDocument = async (
  page: PDFPage,
  fileKey: string
): Promise<Document[]> => {
  const { pageContent, metadata } = page;
  const cleanedContent = pageContent.replace(/\n/g, "");

  const simplifiedMetadata = {
    pageNumber: metadata.loc.pageNumber,
    text: truncateStringByBytes(cleanedContent, 36000),
    fileKey: fileKey
  };

  const splitter = new RecursiveCharacterTextSplitter();
  return splitter.splitDocuments([
    new Document({
      pageContent: cleanedContent,
      metadata: simplifiedMetadata
    }),
  ]);
};