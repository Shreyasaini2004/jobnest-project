// User related types

export interface User {
  _id: string;
  name: string;
  email: string;
  userType: "job-seeker" | "employer";
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  skills?: string;
  bio?: string;
  avatar?: string;
}

export interface EmployerSignupData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyEmail: string;
  jobTitle: string;
  companyWebsite: string;
  password: string;
  confirmPassword: string;
}

export interface JobSeekerSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}