import React from 'react';
import { Link } from 'react-router';

const Break = () => {
	return (
		<>
			<span className='mobile hide'> - </span>
			<br className='mobile show' />
		</>
	);
}

const Footer = () => {
	return (
		<footer style={footerStyles.footer}>
			<p style={footerStyles.text}>
				© Zavo Production 2026
				<Break />
				<Link to='/privacypolicy' style={footerStyles.link}>Privacy Policy</Link>
			</p>
		</footer>
	);
};

const footerStyles = {
	footer: {
		padding: '20px',
		textAlign: 'center',
		background: 'rgba(0, 0, 0, 0.2)',
		backdropFilter: 'blur(10px)',
		borderTop: '1px solid rgba(255, 255, 255, 0.1)',
	},
	text: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: '14px',
		margin: 0,
	},
	link: {
		color: 'rgba(255, 255, 255, 0.9)',
		textDecoration: 'none',
		transition: 'color 0.3s ease',
	},
};

export default Footer;
