import { Contact } from "./contact.model";
import { State } from "./state.model";

export interface Course extends State {
  id: string;
  title: string;
  description: string;
  instructor?: Contact;
  category?: string;
  duration?: string;
  level?: string;
  modules?: Module[];  // Array of Module objects
  startDate?: string;
  endDate?: string;
  enrolledStudents: Contact[];
  status: string;
}

export interface Module {
  moduleId?: string;
  moduleTitle?: string;
  content?: Content[];  // Array of Content objects
}

export interface Content {
  contentId: string;
  contentType: string;  // e.g., "lecture", "video", "reading", "quiz", "assignment"
  contentUrl: string;
  contentDescription: string;
}

  