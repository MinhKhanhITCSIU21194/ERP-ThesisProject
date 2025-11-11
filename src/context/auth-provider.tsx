import { createContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../data/auth/auth";
import axiosInstance from "../utils/axios";

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: (userData: User) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session validity on app start
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Try to get current user from backend using cookie session
      const response = await axiosInstance.get("/api/auth/me");
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log("No valid session found");
      // Clear any localStorage data if exists
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    // Don't store in localStorage since we're using cookies
    // localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Call backend logout to clear cookies
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user"); // Clean up any old localStorage data
    }
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace with a proper loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
