import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('yatrikaUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('yatrikaUser', JSON.stringify(userData));
        if (userData?.token) {
            localStorage.setItem('yatrikaToken', userData.token);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('yatrikaUser');
        localStorage.removeItem('yatrikaToken');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
