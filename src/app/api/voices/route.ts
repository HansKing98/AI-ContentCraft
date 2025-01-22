import { NextResponse } from 'next/server';

export async function GET() {
  const voices = [
    { id: "af", name: "Default", language: "en-us", gender: "Female" },
    { id: "af_bella", name: "Bella", language: "en-us", gender: "Female" },
    { id: "af_nicole", name: "Nicole", language: "en-us", gender: "Female" },
    { id: "af_sarah", name: "Sarah", language: "en-us", gender: "Female" },
    { id: "af_sky", name: "Sky", language: "en-us", gender: "Female" },
    { id: "am_adam", name: "Adam", language: "en-us", gender: "Male" },
    { id: "am_michael", name: "Michael", language: "en-us", gender: "Male" },
    { id: "bf_emma", name: "Emma", language: "en-gb", gender: "Female" },
    { id: "bf_isabella", name: "Isabella", language: "en-gb", gender: "Female" },
    { id: "bm_george", name: "George", language: "en-gb", gender: "Male" },
    { id: "bm_lewis", name: "Lewis", language: "en-gb", gender: "Male" }
  ];
  
  return NextResponse.json(voices);
} 