import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_API_KEY!);
interface final_result {
    role:string,
    content: string
}

export async function POST(
    req: Request
) {
    try {
        const {userId} = await auth();
        const body = await req.json();
        const { messages } = body;
        const lstMessage = messages[messages.length - 1];
        const prompt =lstMessage.content
        

        if (!userId){
            return new NextResponse("Unauthorized" , {status: 401});
        }

        if (!genAI.apiKey){
            return new NextResponse("Openai API Key is not configured" , {status : 500})
        }

        if(!messages){
            return new NextResponse("Messages are required" , {status : 400});
        }

    

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
        const result = await model.generateContent(prompt);
        
        const formatedResult: final_result = {
            role: "assistant",
            content:result.response.text()
        } 

        return NextResponse.json(formatedResult)

    } catch(error){
        console.log("[CONVERSATION ERROR]" , error);
        return new NextResponse("Internal error" , {status: 500})
    }
}