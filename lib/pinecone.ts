// import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
// import { downloadFromS3 } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// import md5 from "md5";
// import {
//   Document,
//   RecursiveCharacterTextSplitter,
// } from "@pinecone-database/doc-splitter";
// import { getEmbeddings } from "./embeddings";
// import { convertToAscii } from "./utils";

// export const getPineconeClient = () => {
//   return new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// type PDFPage = {
//   pageContent: string;
//   metadata: {
//     loc: { pageNumber: number };
//   };
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   // 1. obtain the pdf -> downlaod and read from pdf
//   console.log("downloading s3 into file system");
//   const file_name = await downloadFromS3(fileKey);
//   if (!file_name) {
//     throw new Error("could not download from s3");
//   }
//   console.log("loading pdf into memory" + file_name);
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];

//   // 2. split and segment the pdf
//   const documents = await Promise.all(pages.map(prepareDocument));
//   console.log("spliting....")

//   // 3. vectorise and embed individual documents
//   const vectors = await Promise.all(documents.flat().map(embedDocument));
//   console.log("vectorizing....")
//   // 4. upload to pinecone
//   const client = await getPineconeClient();
//   const pineconeIndex = await client.index("chatpdf");
//   const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
//   console.log("inserting....")

//   console.log("inserting vectors into pinecone");
//   await namespace.upsert(vectors);

//   return documents[0];
// }
// export const embedDocument = async (pdfDoc: any) => {
//   try {
//     console.log("before embeding....")
//     const embeddings = await getEmbeddings(pdfDoc.pageContent);
//     console.log("after embeding")
    
//     if (!embeddings || embeddings.length === 0) {
//       throw new Error("Failed to generate embeddings");
//     }

//     return {
//       id: pdfDoc.metadata.loc.pageNumber.toString(),
//       values: embeddings,
//       metadata: {
//         text: pdfDoc.pageContent,
//         ...pdfDoc.metadata
//       }
//     };
//   } catch (error) {
//     console.error("Error embedding document:", error);
//     throw error;
//   }
// };
// export const truncateStringByBytes = (str: string, bytes: number) => {
//   const enc = new TextEncoder();
//   return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
// };

// async function prepareDocument(page: PDFPage) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, "");
//   // split the docs
//   const splitter = new RecursiveCharacterTextSplitter();
//   const docs = await splitter.splitDocuments([
//     new Document({
//       pageContent,
//       metadata: {
//         pageNumber: metadata.loc.pageNumber,
//         text: truncateStringByBytes(pageContent, 36000),
//       },
//     }),
//   ]);
//   return docs;
// }


import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import { FileKey } from "lucide-react";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. Download the PDF
  console.log("Downloading S3 file into file system...");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("Could not download from S3");
  }
  console.log(`Loaded PDF into memory: ${file_name}`);

  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. Split the PDF
  console.log(`Total pages in PDF: ${pages.length}`);
  const documents = await Promise.all(pages.map(page => prepareDocument(page , fileKey)));
  console.log(`Splitting completed. Total chunks created: ${documents.flat().length}`);

  if (documents.flat().length === 0) {
    throw new Error("No documents generated after splitting.");
  }

  // 3. Generate embeddings
  console.log("Vectorizing documents...");
  const vectors = await Promise.all(documents.flat().map(embedDocument));
  console.log(`Total vectors generated: ${vectors.length}`);

  if (vectors.length === 0) {
    throw new Error("No vectors were created after embedding.");
  }

  // 4. Upload to Pinecone
  console.log("Connecting to Pinecone...");
  const client = await getPineconeClient();
  console.log("Connected to Pinecone.");

  const pineconeIndex = await client.index("genius");
  console.log("Pinecone index fetched.");

  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
  console.log(`Using namespace: ${convertToAscii(fileKey)}`);

  console.log("Inserting vectors into Pinecone...");
  await namespace.upsert(vectors);
  console.log("Insertion into Pinecone completed successfully.");

  return documents[0];
}

export const embedDocument = async (pdfDoc: any) => {
  try {
    const embeddings = await getEmbeddings(pdfDoc.pageContent);
    
    // Flatten metadata for Pinecone compatibility
    const pineconeMetadata = {
      text: truncateStringByBytes(pdfDoc.pageContent, 36000),
      pageNumber: pdfDoc.metadata?.pageNumber || 0,
      // Add other flat metadata fields here
      fileKey: pdfDoc.metadata?.fileKey || ""
      
    };

    return {
      id: md5(`${pdfDoc.pageContent}-${Date.now()}`),
      values: embeddings,
      metadata: pineconeMetadata,
    };
  } catch (error) {
    console.error("Error embedding document:", error);
    throw error;
  }
};

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage , fileKey: string) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  // Simplify metadata structure
  const simplifiedMetadata = {
    pageNumber: metadata?.loc?.pageNumber || 0,
    text: truncateStringByBytes(pageContent, 36000),
    fileKey:fileKey
  };

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: simplifiedMetadata
    }),
  ]);
  
  return docs;
}