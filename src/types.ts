export interface ScriptSection {
  id: string;
  type: 'narration' | 'dialogue';
  character?: string;
  text: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
} 