// 

import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    const { chatId } = await req.json();
    console.log("chat id in get-messages" , chatId)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!chatId || typeof chatId !== "number") {
      return NextResponse.json(
        { error: "Invalid chat ID" },
        { status: 400 }
      );
    }

    // Verify chat ownership
    const chatExists = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, userId)
        )
      );

    if (!chatExists.length) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    const _messages = await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId));

    return NextResponse.json(_messages);

  } catch (error) {
    console.error("[GET_MESSAGES_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};