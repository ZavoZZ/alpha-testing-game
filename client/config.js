// Client-side configuration
// Browser accesează microserviciile prin proxy

const config = {
	// Toate request-urile merg prin main app care face proxy către microservicii
	// În producție (domain): https://ovidiuguru.online/api/auth-service
	// În development (localhost:3000): http://localhost:3000/api/auth-service
	AUTH_URI: typeof window !== 'undefined' 
		? (() => {
			const protocol = window.location.protocol;
			const hostname = window.location.hostname;
			const port = window.location.port;
			
			// Dacă rulezi pe port explicit (development), folosește portul
			// Altfel (producție prin domain), nu adăuga port
			const portSuffix = port ? `:${port}` : '';
			
			return `${protocol}//${hostname}${portSuffix}/api/auth-service`;
		})()
		: 'http://localhost:3000/api/auth-service',
	
	NEWS_URI: typeof window !== 'undefined' 
		? (() => {
			const protocol = window.location.protocol;
			const hostname = window.location.hostname;
			const port = window.location.port;
			const portSuffix = port ? `:${port}` : '';
			return `${protocol}//${hostname}${portSuffix}/api/news-service`;
		})()
		: 'http://localhost:3000/api/news-service',
	
	CHAT_URI: typeof window !== 'undefined' 
		? (() => {
			const protocol = window.location.protocol;
			const hostname = window.location.hostname;
			const port = window.location.port;
			const portSuffix = port ? `:${port}` : '';
			return `${protocol}//${hostname}${portSuffix}/api/chat-service`;
		})()
		: 'http://localhost:3000/api/chat-service',
};

module.exports = config;
