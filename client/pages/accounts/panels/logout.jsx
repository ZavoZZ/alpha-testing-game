import React, { useContext } from 'react';

import { TokenContext } from '../../utilities/token-provider';

/**
 * Logout Component - Buton de delogare
 *
 * Folosește funcția logout din TokenContext care:
 * - Șterge token-ul din localStorage
 * - Face call către server pentru a șterge cookie-ul
 * - Redirectează către homepage
 */
const Logout = () => {
	const { logout } = useContext(TokenContext);

	const handleLogout = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		console.log('[Logout] Initiating logout...');
		await logout();
	};

	return (
		<button
			onClick={handleLogout}
			className="modern-button secondary"
			style={{
				padding: '10px 20px',
				fontSize: '14px',
				cursor: 'pointer',
			}}
		>
			🚪 Logout
		</button>
	);
};

export default Logout;
