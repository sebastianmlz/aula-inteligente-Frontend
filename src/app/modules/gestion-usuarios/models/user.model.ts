export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  active: boolean;
  // Quita password e items si no vienen en la respuesta
}