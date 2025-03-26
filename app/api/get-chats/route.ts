// 

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const chatIdParam = searchParams.get("chatId");
    console.log("CHAT ID IN GET-CHATS",chatIdParam)

    // Authentication check
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Case 1: Get all chats
    if (!chatIdParam) {
      console.log("CHAT ID IN GET-CHATS",chatIdParam)
      const allChats = await db
        .select()
        .from(chats)
        .where(eq(chats.userId, userId));
     

      return NextResponse.json(allChats);
    }

    // Case 2: Get specific chat
    const chatId = parseInt(chatIdParam);
    
    
    // Validate chat ID format
    
    if (isNaN(chatId) || chatId <= 0) {
      
      return NextResponse.json(
        { error: "Invalid chat ID format" },
        { status: 400 }
      );
    }

   
    const chat = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, userId)
        )
      );

    if (!chat.length) {
      console.log("*******************************************************")
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chat[0]);

  } catch (error) {
    console.error("[CHATS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}