export interface User {
  id: string;
  email: string;
  passwordHash: string;
  profileId?: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  age: number;
  bio?: string;
  photos?: string[];
  interests?: string[];
  gender?: string;
  city?: string;
  preferences?: {
    minAge?: number;
    maxAge?: number;
    gender?: string;
    city?: string;
  };
}

export interface Swipe {
  id: string;
  userId: string;
  targetId: string;
  liked: boolean;
  createdAt: string;
}

export interface Match {
  id: string;
  userA: string;
  userB: string;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  createdAt: string;
}
