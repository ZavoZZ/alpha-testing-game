import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './pages/app';
import TokenProvider from './pages/utilities/token-provider';
import GameAuthProvider from './pages/utilities/game-auth-provider';

// Import modern game styles
import './styles/modern-game.css';

ReactDOM
	.createRoot(document.getElementById('root'))
	.render(
		<GameAuthProvider>
			<TokenProvider>
				<App />
			</TokenProvider>
		</GameAuthProvider>
	)
;
