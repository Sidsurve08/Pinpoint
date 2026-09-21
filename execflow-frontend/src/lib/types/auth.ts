export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  expiresInMs: number;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  inviteCode: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiFieldErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
