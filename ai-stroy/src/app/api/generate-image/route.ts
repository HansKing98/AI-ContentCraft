import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || '',
});

export async function POST(req: Request) {
    try {
        const { prompt, sectionId, seed = 1234 } = await req.json();
        
        if (!prompt) {
            return NextResponse.json({ 
                success: false, 
                error: 'Prompt is required' 
            }, { status: 400 });
        }

        const output = await replicate.run(
            "black-forest-labs/flux-schnell",
            {
                input: {
                    prompt: prompt,
                    seed: seed,
                    num_inference_steps: 4,
                    guidance_scale: 7.5
                }
            }
        );

        let imageUrl;
        if (Array.isArray(output)) {
            imageUrl = output[0];
        } else if (typeof output === 'object' && output !== null) {
            if (output.output && Array.isArray(output.output)) {
                imageUrl = output.output[0];
            } else if (output.urls && output.urls.get) {
                imageUrl = output.urls.get;
            }
        } else if (typeof output === 'string' && output.startsWith('http')) {
            imageUrl = output;
        }

        if (!imageUrl) {
            throw new Error('No valid image URL in API response');
        }

        return NextResponse.json({ 
            success: true,
            imageUrl: String(imageUrl),
            sectionId: sectionId
        });
    } catch (error: any) {
        console.error('Error generating image:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
} 