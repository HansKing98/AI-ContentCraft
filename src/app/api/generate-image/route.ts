import { NextResponse } from 'next/server';
import { replicate } from '@/app/utils/api-utils';

export async function POST(req: Request) {
  const { prompt, sectionId, seed = 1234 } = await req.json();
  
  if (!prompt) {
    return NextResponse.json({ 
      success: false, 
      error: 'Prompt is required' 
    }, { status: 400 });
  }
  
  try {
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
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (typeof output === 'object' && output !== null) {
      imageUrl = output.url || output.output?.[0] || output.image;
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
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 