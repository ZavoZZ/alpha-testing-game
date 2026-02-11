import React, { createContext, useState, useEffect } from 'react';

export const GameAuthContext = createContext();

const GameAuthProvider = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Check session on mount
	useEffect(() => {
		const checkSession = async () => {
			const token = localStorage.getItem('gameAuthToken');
			
			if (!token) {
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch('/api/auth/validate', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token }),
				});

				const data = await response.json();

				if (data.success) {
					setIsAuthenticated(true);
				} else {
					localStorage.removeItem('gameAuthToken');
					setIsAuthenticated(false);
				}
			} catch (error) {
				console.error('Session validation error:', error);
				localStorage.removeItem('gameAuthToken');
				setIsAuthenticated(false);
			}

			setIsLoading(false);
		};

		checkSession();
	}, []);

	const login = async (password) => {
		try {
			const response = await fetch('/api/auth/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ password }),
			});

			const data = await response.json();

			if (data.success) {
				localStorage.setItem('gameAuthToken', data.token);
				setIsAuthenticated(true);
				return { success: true };
			} else {
				return { success: false, message: data.message };
			}
		} catch (error) {
			console.error('Login error:', error);
			return { success: false, message: 'Connection error' };
		}
	};

	const logout = async () => {
		const token = localStorage.getItem('gameAuthToken');
		
		try {
			await fetch('/api/auth/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ token }),
			});
		} catch (error) {
			console.error('Logout error:', error);
		}

		localStorage.removeItem('gameAuthToken');
		setIsAuthenticated(false);
	};

	return (
		<GameAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
			{children}
		</GameAuthContext.Provider>
	);
};

export default GameAuthProvider;
