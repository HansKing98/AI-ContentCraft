export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
  info?: string;
  purchased?: boolean;
  instanceId?: string;
}

export interface ScriptSection {
  id: string;
  type: 'narration' | 'dialogue';
  text: string;
  character?: string;
  voice?: string;
}

export interface PodcastDialog {
  host: 'A' | 'B';
  text: string;
  voice?: string;
} 