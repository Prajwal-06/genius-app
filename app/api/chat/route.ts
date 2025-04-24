import { OpenAI } from "openai";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";

export const runtime = "nodejs";

const openai = new OpenAI({
  baseURL: process.env['BASE_URL'],
  apiKey: process.env['OPENAI_API_KEY']
});

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);
    console.log("Context:" , context)

    const prompt = {
      role: "system" as const,
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided.
      If the context doesn't provide the answer, say "I don't know the answer to that question".`,
    };

    // Save user message
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    // Get complete response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: false, // Disable streaming
      messages: [
        prompt,
        ...messages.filter((message: { role: string }) => message.role === "user"),
      ],
    });
    console.log("response:",response.choices[0])
    const aiResponse = response.choices[0]?.message?.content || "I don't know the answer to that question.";
    

    // Save AI response
    await db.insert(_messages).values({
      chatId,
      content: aiResponse,
      role: "system",
    });

    // Simulate loading with three dots
    const loadingResponse = aiResponse.split(' ').map(word => 
      word === '...' ? '...' : word
    ).join(' ');

    return NextResponse.json( loadingResponse);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}