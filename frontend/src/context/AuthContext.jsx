import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  //  FIXED: Only run on mount OR token changes (NOT user changes)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      // Only update if we have NEW tenant data
      setUser((prev) => {
        if (prev?.tenantId && prev.tenantId === payload.tenantId) {
          return prev; // No change needed
        }
        return {
          ...prev,
          ...payload,
          tenantId: payload.tenantId || prev?.tenantId,
          tenantName: payload.tenantName || prev?.tenantName,
        };
      });
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []); //  FIXED: EMPTY DEPENDENCY ARRAY

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("videosCount");
    setUser(null);
  };

  const isAuthenticated = !!user?.tenantId;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
