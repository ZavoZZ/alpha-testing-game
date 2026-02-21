import React, { useState, useEffect, createContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const config = require('../../config');

export const TokenContext = createContext();

/**
 * TokenProvider - Gestionează autentificarea și sesiunile utilizatorilor
 *
 * Features:
 * - Auto-refresh token cu 5 minute înainte de expirare
 * - Sesiuni persistente cu Remember Me
 * - Logout funcțional cu redirect
 * - Verificare token la pornire
 */
const TokenProvider = (props) => {
	// State pentru access token
	const [accessToken, setAccessToken] = useState('');

	// Încarcă token-ul din localStorage la pornire
	useEffect(() => {
		const storedToken = localStorage.getItem('accessToken');
		if (storedToken) {
			try {
				// Verifică dacă token-ul este valid
				const decoded = jwtDecode(storedToken);
				const now = Date.now() / 1000;

				if (decoded.exp > now) {
					// Token-ul este valid
					setAccessToken(storedToken);
					console.log(
						'[TokenProvider] Token loaded from storage, expires in:',
						Math.round(decoded.exp - now),
						'seconds',
					);
				} else {
					// Token-ul a expirat, îl ștergem
					console.log('[TokenProvider] Stored token expired, removing');
					localStorage.removeItem('accessToken');
				}
			} catch (error) {
				console.error('[TokenProvider] Invalid stored token:', error);
				localStorage.removeItem('accessToken');
			}
		}
	}, []);

	// Salvează token-ul în localStorage când se schimbă
	useEffect(() => {
		if (accessToken) {
			localStorage.setItem('accessToken', accessToken);
		}
	}, [accessToken]);

	// Force logout - șterge tot și redirectează
	const forceLogout = useCallback(() => {
		console.log('[TokenProvider] Force logout triggered');
		localStorage.removeItem('accessToken');
		setAccessToken('');

		// Clear refresh token cookie prin API call
		fetch(`${config.AUTH_URI}/auth/logout`, {
			method: 'POST',
			credentials: 'include',
		}).catch((err) => console.error('[TokenProvider] Logout error:', err));

		// Redirect la login
		window.location.href = '/login';
	}, []);

	// Refresh token
	const refreshToken = useCallback(async () => {
		try {
			console.log('[TokenProvider] Refreshing token...');

			const response = await fetch(`${config.AUTH_URI}/auth/refresh`, {
				method: 'POST',
				credentials: 'include',
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					console.log('[TokenProvider] Refresh failed, forcing logout');
					forceLogout();
					return null;
				}
				throw new Error(`Refresh failed: ${response.status}`);
			}

			const newToken = await response.text();
			console.log('[TokenProvider] Token refreshed successfully');
			setAccessToken(newToken);
			return newToken;
		} catch (error) {
			console.error('[TokenProvider] Refresh error:', error);
			forceLogout();
			return null;
		}
	}, [forceLogout]);

	// Auto-refresh cu 5 minute înainte de expirare
	useEffect(() => {
		if (!accessToken) return;

		let refreshTimeout;
		let checkInterval;

		const checkAndRefresh = async () => {
			try {
				const decoded = jwtDecode(accessToken);
				const expiresAt = decoded.exp * 1000; // Convert to milliseconds
				const now = Date.now();
				const fiveMinutes = 5 * 60 * 1000;

				// Dacă expiră în mai puțin de 5 minute, refresh acum
				if (expiresAt - now < fiveMinutes && expiresAt - now > 0) {
					console.log('[TokenProvider] Token expiring soon, refreshing...');
					await refreshToken();
				} else if (expiresAt - now <= 0) {
					// Token-ul a expirat
					console.log('[TokenProvider] Token expired');
					forceLogout();
				}
			} catch (error) {
				console.error('[TokenProvider] Token check error:', error);
			}
		};

		// Verifică la fiecare minut
		checkInterval = setInterval(checkAndRefresh, 60000);

		// Prima verificare după 5 secunde
		refreshTimeout = setTimeout(checkAndRefresh, 5000);

		return () => {
			clearInterval(checkInterval);
			clearTimeout(refreshTimeout);
		};
	}, [accessToken, refreshToken, forceLogout]);

	// Logout funcțional
	const logout = useCallback(async () => {
		console.log('[TokenProvider] Logout initiated');

		try {
			await fetch(`${config.AUTH_URI}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			});
		} catch (error) {
			console.error('[TokenProvider] Logout API error:', error);
		}

		// Șterge token-ul din localStorage și state
		localStorage.removeItem('accessToken');
		setAccessToken('');

		// Redirect la homepage
		window.location.href = '/';
	}, []);

	// Wrap fetch cu auto-refresh
	const tokenFetch = useCallback(
		async (url, options = {}) => {
			// Verifică dacă token-ul expiră curând
			if (accessToken) {
				try {
					const decoded = jwtDecode(accessToken);
					const now = Date.now() / 1000;
					const fiveMinutes = 5 * 60;

					// Dacă expiră în mai puțin de 5 minute, refresh întâi
					if (decoded.exp - now < fiveMinutes) {
						const newToken = await refreshToken();
						if (!newToken) {
							throw new Error('Session expired');
						}
						// Folosește noul token
						return fetch(url, {
							...options,
							headers: {
								...options.headers,
								Authorization: `Bearer ${newToken}`,
							},
							credentials: 'include',
						});
					}
				} catch (error) {
					if (error.message !== 'Session expired') {
						console.error('[TokenProvider] Token check error:', error);
					}
				}
			}

			// Dacă e request de logout, nu adăuga Authorization header
			if (url === `${config.AUTH_URI}/auth/logout`) {
				return fetch(url, {
					method: 'POST',
					credentials: 'include',
				});
			}

			// Request normal cu token
			return fetch(url, {
				...options,
				headers: {
					...options.headers,
					Authorization: `Bearer ${accessToken}`,
				},
				credentials: 'include',
			});
		},
		[accessToken, refreshToken],
	);

	// Callback cu token
	const tokenCallback = useCallback(
		async (cb) => {
			if (!accessToken) {
				return cb(null);
			}

			try {
				const decoded = jwtDecode(accessToken);
				const now = Date.now() / 1000;

				// Dacă token-ul a expirat
				if (decoded.exp < now) {
					const newToken = await refreshToken();
					if (!newToken) {
						return cb(null);
					}
					return cb(newToken);
				}

				return cb(accessToken);
			} catch (error) {
				console.error('[TokenProvider] Token callback error:', error);
				return cb(null);
			}
		},
		[accessToken, refreshToken],
	);

	// Decode token payload
	const getPayload = useCallback(() => {
		if (!accessToken) return null;
		try {
			return jwtDecode(accessToken);
		} catch (error) {
			console.error('[TokenProvider] Decode error:', error);
			return null;
		}
	}, [accessToken]);

	// Verifică dacă utilizatorul este autentificat
	const isAuthenticated = useCallback(() => {
		if (!accessToken) return false;
		try {
			const decoded = jwtDecode(accessToken);
			return decoded.exp > Date.now() / 1000;
		} catch {
			return false;
		}
	}, [accessToken]);

	return (
		<TokenContext.Provider
			value={{
				accessToken,
				setAccessToken,
				tokenFetch,
				tokenCallback,
				getPayload,
				logout,
				isAuthenticated,
				refreshToken,
			}}
		>
			{props.children}
		</TokenContext.Provider>
	);
};

export default TokenProvider;
