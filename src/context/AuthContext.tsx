import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "staff" | "user" | "guest";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: "view" | "buy" | "edit" | "admin") => boolean;
}

// Demo users for testing
const demoUsers: User[] = [
  { id: 1, email: "admin@example.com", name: "Admin User", role: "admin" },
  { id: 2, email: "staff@example.com", name: "Staff User", role: "staff" },
  { id: 3, email: "user@example.com", name: "Regular User", role: "user" },
];

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Simple signup implementation for demo
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const existingUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: demoUsers.length + 1,
      email: email,
      name: name,
      role: "user", // New users are always regular users
    };

    // Add to demo users (in a real app, this would be a backend API call)
    demoUsers.push(newUser);

    // Set user in state and localStorage
    setUser(newUser);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    return true;
  };

  // Simple login implementation for demo
  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes, we'll accept any password
    const foundUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      return false;
    }
    
    // Set user in state and localStorage
    setUser(foundUser);
    localStorage.setItem("authUser", JSON.stringify(foundUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
    
    // Redirect to login page after logout
    window.location.href = "/login";
  };

  // Check if user has permission based on role
  const hasPermission = (permission: "view" | "buy" | "edit" | "admin") => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === "admin") return true;
    
    switch (permission) {
      case "view":
        // All authenticated users can view
        return true;
      case "buy":
        // All authenticated users can buy
        return true;
      case "edit":
        // Only admin and staff can edit
        return user.role === "staff";
      case "admin":
        // Only admin has full access
        return false;
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
