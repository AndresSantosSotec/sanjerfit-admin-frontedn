export interface GeneralInfo {
  id: number;
  title: string;
  content: string;
  category?: string | null;

  image_path?: string | null;

  video_path?: string | null;

  image_url?: string | null;
  video_url?: string | null;

}
