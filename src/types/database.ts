export type UserRole = 'hoca' | 'yonetici' | 'arastirmaci';

export type AnnouncementPriority = 'acil' | 'toplanti' | 'soru_yardim' | 'kaynak_paylasimi';

export type ResourceCategory = 'kitap_makale' | 'faydali_link' | 'kod_script';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  academic_title: string;
  department: string;
  avatar_url?: string | null;
  research_topics: string[];
  scholar_url?: string | null;
  orcid?: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  author_id: string;
  telegram_sent: boolean;
  telegram_message_id?: string | null;
  created_at: string;
  author?: Profile;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  category: ResourceCategory;
  file_url?: string | null;
  external_url?: string | null;
  code_snippet?: string | null;
  language: string;
  tags: string[];
  uploader_id: string;
  created_at: string;
  uploader?: Profile;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor_id: string;
  semester: string;
  syllabus?: string | null;
  created_at: string;
  instructor?: Profile;
  materials?: CourseMaterial[];
}

export interface CourseMaterial {
  id: string;
  course_id: string;
  week_number: number;
  title: string;
  description?: string | null;
  file_url: string;
  uploader_id: string;
  created_at: string;
  uploader?: Profile;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  notes?: string | null;
  presentation_url?: string | null;
  creator_id: string;
  created_at: string;
  creator?: Profile;
}

export interface StudentWorkspace {
  id: string;
  student_id: string;
  thesis_title: string;
  advisor?: string | null;
  summary?: string | null;
  simulation_notes?: string | null;
  created_at: string;
  updated_at: string;
  student?: Profile;
  files?: WorkspaceFile[];
  logs?: WorkspaceLog[];
}

export interface WorkspaceFile {
  id: string;
  workspace_id: string;
  file_name: string;
  file_url: string;
  file_size?: string | null;
  uploaded_by: string;
  notes?: string | null;
  created_at: string;
  uploader?: Profile;
}

export interface WorkspaceLog {
  id: string;
  workspace_id: string;
  actor_id: string;
  action: string;
  created_at: string;
  actor?: Profile;
}
