export interface TimelineEntry {
  event: 'reported' | 'status_changed' | 'verified' | 'commented';
  ts: number; // timestamp in ms
  userId: string;
  userName: string;
  note?: string;
}

export interface Verification {
  uid: string;
  userName: string;
  ts: number;
  note?: string;
  mediaUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: number;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  aiDescription?: string;
  category: 'Pothole' | 'Water' | 'Light' | 'Waste' | 'Infrastructure' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  lat: number;
  lng: number;
  address: string;
  landmark?: string;
  mediaUrls: string[];
  reportedBy: string;
  reportedByName: string;
  reportedByPhoto?: string;
  reportedAt: number;
  upvoteCount: number;
  verifications: Verification[];
  timeline: TimelineEntry[];
  resolvedAt?: number;
  resolvedBy?: string;
  aiCategoryConfidence?: number;
  aiTags?: string[];
  upvotedBy?: string[]; // array of user uids who upvoted
  comments?: Comment[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  role: 'citizen' | 'authority' | 'admin';
  xp: number;
  level: number;
  badges: string[];
  issuesReported: number;
  issuesVerified: number;
  issuesResolved: number;
  joinedAt: number;
  streak: number;
}
