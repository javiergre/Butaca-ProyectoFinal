// TODO: AuthProvider con session, user, loading, signIn(provider), signOut() usando Supabase Auth
export function AuthProvider({ children }) {
  return children;
}
export const useAuth = () => ({ user: null, loading: false, signIn() {}, signOut() {} });
