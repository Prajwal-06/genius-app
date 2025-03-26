import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { getS3Url } from "@/lib/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("from crete chat")
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    
    // Validate input
    if (!file_key || !file_name) {
      
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Process PDF
    await loadS3IntoPinecone(file_key);

    // Create chat record
    const [chat] = await db.insert(chats).values({
      fileKey: file_key,
      pdfName: file_name,
      pdfUrl: getS3Url(file_key),
      userId,
    }).returning({ 
      insertedId: chats.id 
    });

    if (!chat) {
      throw new Error("Failed to create chat");
    }

    return NextResponse.json(
      { chat_id: chat.insertedId },
      { status: 200 }
    );

  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}