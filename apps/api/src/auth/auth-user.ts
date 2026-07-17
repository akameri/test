export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export const DEMO_USER: AuthUser = {
  id: 'demo-admin',
  name: 'Demo Admin',
  email: 'admin@example.com',
  roles: ['admin', 'ciso'],
};
