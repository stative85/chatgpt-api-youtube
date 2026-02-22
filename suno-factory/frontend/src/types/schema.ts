export interface LyricSegment {
  section_type: string;
  tags: string[];
  lyrics: string;
}

export interface VisualPrompt {
  midjourney: string;
  stable_diffusion: string;
  negative_prompt: string;
}

export interface SongMetadata {
  title: string;
  style_tags: string;
  instrumental: boolean;
}

export interface SongPackage {
  id: string;
  metadata: SongMetadata;
  structure: LyricSegment[];
  visuals: VisualPrompt;
  formatted_lyrics: string;
}
