export interface GeoMetadata {
  has_geo_metadata: boolean;
  crs: string | null;
  bbox_min_lon: number | null;
  bbox_min_lat: number | null;
  bbox_max_lon: number | null;
  bbox_max_lat: number | null;
  pixel_resolution_m: number | null;
  acquisition_date: string | null;
}

export interface ImageOut {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  geo: GeoMetadata;
  source: "upload" | "fetched";
  place_name: string | null;
  marker_x: number | null;
  marker_y: number | null;
  query_lat: number | null;
  query_lon: number | null;
}

export interface SessionOut {
  id: string;
  title: string;
  mode: "single" | "compare";
  image_id: string | null;
  before_image_id: string | null;
  after_image_id: string | null;
  project_id: string | null;
  created_at: string;
}

export interface ProjectOut {
  id: string;
  name: string;
  description: string | null;
  session_count: number;
  created_at: string;
  updated_at: string;
}

export interface GeocodeMatch {
  display_name: string;
  lat: number;
  lon: number;
}

export interface AdminImageRow {
  id: string;
  filename: string;
  thumbnail_url: string | null;
  source: "upload" | "fetched";
  place_name: string | null;
  query_lat: number | null;
  query_lon: number | null;
  has_geo_metadata: boolean;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  created_at: string;
}

export interface AdminStats {
  total_images: number;
  uploaded_count: number;
  fetched_count: number;
  georeferenced_count: number;
}

export interface WeatherInfo {
  temperature_c: number;
  humidity_percent: number | null;
  wind_speed_kmh: number | null;
  precipitation_mm: number | null;
  condition: string;
  is_day: boolean;
}

export interface ClassStat {
  key: string;
  label: string;
  color: string;
  pixel_count: number;
  pixel_percentage: number;
  area_hectares: number | null;
}

export interface ChangeStat {
  label: string;
  color: string;
  before_pixel_percentage: number;
  after_pixel_percentage: number;
  delta_percentage: number;
  before_area_hectares: number | null;
  after_area_hectares: number | null;
  delta_area_hectares: number | null;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface Evidence {
  summary: string;
  supporting_points: string[];
  method: string;
  confidence: number | null;
  caveats: string[];
}

export interface AnalysisResult {
  intent: string;
  answer: string;
  evidence: Evidence;
  class_stats: ClassStat[];
  change_stats: ChangeStat[];
  objects: DetectedObject[];
  overlay_image_url: string | null;
  before_overlay_url: string | null;
  after_overlay_url: string | null;
  change_map_url: string | null;
  chart_data: Record<string, any>[];
  geo_available: boolean;
  notes: string[];
}

export interface HistoryEntry {
  id: string;
  question: string;
  intent: string | null;
  answer: string | null;
  result: AnalysisResult | null;
  created_at: string;
}

export interface SystemStatus {
  app_name: string;
  version: string;
  demo_mode: boolean;
  gemini_configured: boolean;
  vlm_backend: "gemini" | "mock";
}
