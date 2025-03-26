import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
    baseURL: process.env['BASE_URL'],
  apiKey: process.env['OPENAI_API_KEY'], 
});



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

        const response = await client.chat.completions.create({
            messages: [...messages],
            model: 'gpt-4o',
          });

          return NextResponse.json(response.choices[0].message)

    } catch(error){
        console.log("[CONVERSATION ERROR]" , error);
        return new NextResponse("Internal error" , {status: 500})
    }
}