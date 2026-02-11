//react
import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { TokenContext } from './utilities/token-provider';
import { GameAuthContext } from './utilities/game-auth-provider';

//styling
import '../styles/styles.css';

//password protection
import PasswordScreen from './password-screen';

//common components
import Footer from './panels/footer';
import PopupChat from './panels/popup-chat';

//lazy wrappers
const Homepage = lazy(() => import('./homepage'));
const Signup = lazy(() => import('./accounts/signup'));
const Login = lazy(() => import('./accounts/login'));
const Account = lazy(() => import('./accounts/account'));
const Dashboard = lazy(() => import('./dashboard'));
const Recover = lazy(() => import('./accounts/recover'));
const Reset = lazy(() => import('./accounts/reset'));
const AdminPanel = lazy(() => import('./administration/admin-panel'));
const Admin = lazy(() => import('./administration/admin'));
const Mod = lazy(() => import('./administration/mod'));
const PrivacyPolicy = lazy(() => import('./static/privacy-policy'));
const Credits = lazy(() => import('./static/credits'));
const NotFound = lazy(() => import('./not-found'));

const App = props => {
	const authTokens = useContext(TokenContext);
	const { isAuthenticated, isLoading } = useContext(GameAuthContext);

	// Show loading screen while checking session
	if (isLoading) {
		return (
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				color: 'white',
				fontSize: '24px',
				fontFamily: 'system-ui'
			}}>
				<div>
					<div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>⏳</div>
					<div>Loading...</div>
				</div>
			</div>
		);
	}

	// Show password screen if not authenticated
	if (!isAuthenticated) {
		return <PasswordScreen />;
	}

	//default render - only accessible after password verification
	return (
		<BrowserRouter>
			<Suspense>
				<Routes>
					<Route exact path='/' element={<Homepage />} />

					<Route path='/signup' element={<Signup />} />
					<Route path='/login' element={<Login />} />
					<Route path='/account' element={<Account />} />
					<Route path='/dashboard' element={<Dashboard />} />

					<Route path='/recover' element={<Recover />} />
					<Route path='/reset' element={<Reset />} />

				<Route path='/admin-panel' element={<AdminPanel />} />
				<Route path='/admin' element={<Admin />} />
				<Route path='/mod' element={<Mod />} />

					<Route path='/privacypolicy' element={<PrivacyPolicy />} />
					<Route path='/credits' element={<Credits />} />

					<Route path='*' element={<NotFound />} />
				</Routes>
			</Suspense>
			{ authTokens.accessToken ? <PopupChat /> : <></> }
			<Footer />
		</BrowserRouter>
	);
};

export default App;
