import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import {OpenAI} from 'openai';

const client = new OpenAI({
    baseURL: process.env['BASE_URL'],
  apiKey: process.env['OPENAI_API_KEY'], 
});

interface instruction{
    role: string,
    content: string,
}

const instructionMessage: instruction ={
    role: "system",
    content: "you are AI only personalize for conversation purpose. "
}


console.log("deepseek thinking....")

export async function POST(
    req: Request
) {
    try {
        const {userId} = await auth();
        const body = await req.json();
        const { messages } = body;

        if (!userId){
            return new NextResponse("Unauthorized" , {status: 401});
        }

        if (!client.apiKey){
            return new NextResponse("Openai API Key is not configured" , {status : 500})
        }

        if(!messages){
            return new NextResponse("Messages are required" , {status : 400});
        }

        const response_1 = await client.chat.completions.create({
            messages: [instructionMessage , ...messages],
            model: 'deepseek-r1',
          });
        const context_1 = response_1.choices[0].message
        console.log(context_1)
        const response_2 = await client.chat.completions.create({
            messages: [instructionMessage , ...messages],
            model: 'gpt-4o',
          });
        const context_2 = response_2.choices[0].message
        console.log(context_2)

          const prompt = {
            role: "system" as const,
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            START CONTEXT BLOCK
            ${context_1} & ${context_2}
            END OF CONTEXT BLOCK
            AI assistant will take into account two CONTEXT BLOCK that is provided.Response should be well sructured and clear for beginner `
          };

          const response = await client.chat.completions.create({
            model: "gpt-4o",
            stream: false,
            messages: [
              prompt,
              ...messages.filter((message: { role: string }) => message.role === "user"),
            ],
          });
          return NextResponse.json(response.choices[0].message)

    } catch(error){
        console.log("[Code ERROR]" , error);
        return new NextResponse("Internal error" , {status: 500})
    }
}