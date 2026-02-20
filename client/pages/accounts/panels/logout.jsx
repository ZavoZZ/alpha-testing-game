import React, { useContext, useRef } from 'react';
import { Link } from 'react-router';

import { TokenContext } from '../../utilities/token-provider';

const config = require('../../../config');

//TODO: make this an ACTUAL BUTTON
const Logout = () => {
	const authTokens = useContext(TokenContext);

	return (
		<>
		{ /* Logout logs you out of the server too */ }
		<Link to='/' onClick={async () => {
			const result = await authTokens.tokenFetch(`${config.AUTH_URI}/auth/logout`, {
				method: 'POST'  // Fixed: server expects POST, not DELETE
			});

			//any problems?
			if (!result.ok) {
				console.error(await result.text());
			} else {
				authTokens.setAccessToken('');
			}
		}}>Logout</Link>
		</>
	);
};

export default Logout;