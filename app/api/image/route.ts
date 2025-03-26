// route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const API_KEY = "8362f926-b3a5-4ecb-8951-42e6ceacca22";
const BASE_URL = "https://api.imagepig.com/";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { prompt } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!API_KEY) {
            return new NextResponse("ImagePig API Key is not configured", { status: 500 });
        }

        if (!prompt) {
            return new NextResponse("Prompt is required", { status: 400 });
        }

        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Api-Key": API_KEY
            },
            body: JSON.stringify({
                positive_prompt: prompt,
                format: "JPEG"
            }),
        });

        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(data.error || "Failed to generate image");
        }

        const imageUrl = data.image_url || (data.image_data ? `data:image/jpeg;base64,${data.image_data}` : null);
        if (!imageUrl) {
            throw new Error("No valid image URL returned from API");
        }
        return NextResponse.json({ imageUrl });

    } catch (error) {
        console.log("[Image Generation ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
