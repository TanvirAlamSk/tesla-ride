import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const getUserFromToken = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );

    return {
      userId: decodedPayload.userId,
      role: decodedPayload.role,
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem("token");

    return getUserFromToken(storedToken);
  });

  const login = (newToken, userData = null) => {
    localStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(userData || getUserFromToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};