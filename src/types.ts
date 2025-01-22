export interface ScriptSection {
  id: string;
  type: 'narration' | 'dialogue';
  character?: string;
  text: string;
} 