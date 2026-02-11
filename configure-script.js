//setup
const readline = require('readline');
const fs = require('fs');
const crypto = require("crypto");

const uuid = (bytes = 16) => crypto.randomBytes(bytes).toString("hex");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

//manually promisify this (util didn't work)
const question = (prompt, def = null) => {
	return new Promise((resolve, reject) => {
		rl.question(`${prompt}${def ? ` (${def})` : ''}: `, answer => {
			//loop on required
			if (def === null && !answer) {
				return resolve(question(prompt, def));
			}

			return resolve(answer || def);
		});
	});
};

//questions
(async () => {
	console.log(
`This configure script will generate the following files:

* docker-compose.yml
* Dockerfile

Currently, all microservices are mandatory; you'll have to mess with the result
and the source code if you wish to be more selective. Microservices currently
implemented are:

* auth-server
* news-server
* chat-server

NOTE: This template now uses MongoDB instead of MariaDB/MySQL.

See https://github.com/krgamestudios/MERN-template/wiki for help.
`
);

	// //determine local computer address for mac user vs everyone else
	// let macUser = '';
	// while (macUser.toLowerCase() !== 'yes' && macUser.toLowerCase() !== 'no') {
	// 	macUser = await question('Will the MERN-Template be running locally on a MacOS system? (yes or no, this only alters startup.sql)', '');
	// }

	// const localAddress = macUser === 'yes' ? 'localhost' : '%';
	const localAddress = '%';

	//project configuration
	const projectName = await question('Project Name', 'template');
	const projectWebAddress = await question('Project Web Address', 'example.com');

	const corsWebOrigin = await question('CORS Web Origin', `https://${projectWebAddress}`);

  let projectDBLocation = '';
  while (typeof projectDBLocation != 'string' || /^[le]/i.test(projectDBLocation[0]) == false) {
    projectDBLocation = await question('Project [l]ocal or [e]xternal database?');
  }

  let projectDBHost = '';
  let projectDBPort = '';

  if (/^[l]/i.test(projectDBLocation[0])) {
    projectDBHost = 'database';
    projectDBPort = '27017';
  }
  else {
    projectDBHost = await question('Project DB Host');
    projectDBPort = await question('Project DB Port', '27017');
  }

	// MongoDB doesn't require username/password setup for local development

	//news configuration
	const newsName = await question('News Name', 'news');
	const newsWebAddress = await question('News Web Address', `${newsName}.${projectWebAddress}`);

  let newsDBLocation = '';
  while (typeof newsDBLocation != 'string' || /^[le]/i.test(newsDBLocation[0]) == false) {
    newsDBLocation = await question('News [l]ocal or [e]xternal database?');
  }

  let newsDBHost = '';
  let newsDBPort = '';

  if (/^[l]/i.test(newsDBLocation[0])) {
    newsDBHost = 'database';
    newsDBPort = '27017';
  }
  else {
    newsDBHost = await question('News DB Host');
    newsDBPort = await question('News DB Port', '27017');
  }

	// MongoDB doesn't require username/password setup for local development

	//auth configuration
	const authName = await question('Auth Name', 'auth');
	const authWebAddress = await question('Auth Web Address', `${authName}.${projectWebAddress}`);
	const authPostValidationHookArray = await question('Auth Post Validation Hook Array', '');
	const authResetAddress = await question('Auth Reset Addr', `${projectWebAddress}/reset`);

  let authDBLocation = '';
  while (typeof authDBLocation != 'string' || /^[le]/i.test(authDBLocation[0]) == false) {
    authDBLocation = await question('Auth [l]ocal or [e]xternal database?');
  }

  let authDBHost = '';
  let authDBPort = '';

  if (/^[l]/i.test(authDBLocation[0])) {
    authDBHost = 'database';
    authDBPort = '27017';
  }
  else {
    authDBHost = await question('Auth DB Host');
    authDBPort = await question('Auth DB Port', '27017');
  }

	// MongoDB doesn't require username/password setup for local development

	const emailSMTP = await question('Email SMTP', 'smtp.example.com');
	const emailUser = await question('Email Address', 'foobar@example.com');
	const emailPass = await question('Email Password', 'foobar');
	const emailPhysical = await question('Physical Mailing Address', '');

	//chat goes here
	const chatName = await question('Chat Name', 'chat');
	const chatWebAddress = await question('Chat Web Address', `${chatName}.${projectWebAddress}`);

  let chatDBLocation = '';
  while (typeof chatDBLocation != 'string' || /^[le]/i.test(chatDBLocation[0]) == false) {
    chatDBLocation = await question('Chat [l]ocal or [e]xternal database?');
  }

  let chatDBHost = '';
  let chatDBPort = '';

  if (/^[l]/i.test(chatDBLocation[0])) {
    chatDBHost = 'database';
    chatDBPort = '27017';
  }
  else {
    chatDBHost = await question('Chat DB Host');
    chatDBPort = await question('Chat DB Port', '27017');
  }

	// MongoDB doesn't require username/password setup for local development

	// MongoDB configuration - no root password or timezone needed for basic setup

	//joint configuration
	const accessToken = await question('Access Token Secret', uuid(32));
	const refreshToken = await question('Refresh Token Secret', uuid(32));

	console.log('--Leave "Default User" blank if you don\'t want one--');
	const defaultUser = await question('Default Admin User', '');

	//MUST be at least 8 chars
	let tmpPass = '';
  let tmpHost = '';
	while (defaultUser && tmpPass.length < 8) {
		console.log('--All passwords must be at least 8 characters long--');
		tmpPass = await question('Default Admin Pass', '');
    tmpHost = await question('Default Admin Host', '');
	}
	const defaultPass = tmpPass;
  const defaultHost = tmpHost;

	if (defaultUser) {
		console.log(`Default user email will be: ${defaultUser}@${defaultHost}`);
	}

	//traefic configuration
	const supportEmail = await question('Support Email', emailUser);

	//misc. configuration
	const projectPort = '3000';
	const newsPort = '3100';
	const authPort = '3200';
	const chatPort = '3300';

const ymlfile = `
services:
  ${projectName}:
    build: .
    ports:
      - ${projectPort}
    labels:
      - traefik.enable=true
      - traefik.http.routers.${projectName}router.rule=Host(\`${projectWebAddress}\`)
      - traefik.http.routers.${projectName}router.entrypoints=websecure
      - traefik.http.routers.${projectName}router.tls.certresolver=myresolver
      - traefik.http.routers.${projectName}router.service=${projectName}service@docker
      - traefik.http.services.${projectName}service.loadbalancer.server.port=${projectPort}
    environment:
      - WEB_ORIGIN=${corsWebOrigin}
      - WEB_PORT=${projectPort}
      - DB_URI=mongodb://${projectDBHost}:${projectDBPort}/${projectName}
      - NEWS_URI=https://${newsWebAddress}
      - AUTH_URI=https://${authWebAddress}
      - CHAT_URI=https://${chatWebAddress}
      - SECRET_ACCESS=${accessToken}
    volumes:
      - /etc/localtime:/etc/localtime:ro
    networks:
      - app-network
    depends_on:${ projectDBHost != 'database' ? '' : `
      - database`}
      - traefik

  ${newsName}:
    image: krgamestudios/news-server:latest
    ports:
      - ${newsPort}
    labels:
      - traefik.enable=true
      - traefik.http.routers.${newsName}router.rule=Host(\`${newsWebAddress}\`)
      - traefik.http.routers.${newsName}router.entrypoints=websecure
      - traefik.http.routers.${newsName}router.tls.certresolver=myresolver
      - traefik.http.routers.${newsName}router.service=${newsName}service@docker
      - traefik.http.services.${newsName}service.loadbalancer.server.port=${newsPort}
    environment:
      - WEB_ORIGIN=${corsWebOrigin}
      - WEB_PORT=${newsPort}
      - DB_URI=mongodb://${newsDBHost}:${newsDBPort}/${newsName}
      - PAGE_SIZE=10
      - SECRET_ACCESS=${accessToken}
    volumes:
      - /etc/localtime:/etc/localtime:ro
    networks:
      - app-network
    depends_on:${ newsDBHost != 'database' ? '' : `
      - database`}
      - traefik

  ${authName}:
    image: krgamestudios/auth-server:latest
    ports:
      - ${authPort}
    labels:
      - traefik.enable=true
      - traefik.http.routers.${authName}router.rule=Host(\`${authWebAddress}\`)
      - traefik.http.routers.${authName}router.entrypoints=websecure
      - traefik.http.routers.${authName}router.tls.certresolver=myresolver
      - traefik.http.routers.${authName}router.service=${authName}service@docker
      - traefik.http.services.${authName}service.loadbalancer.server.port=${authPort}
    environment:
      - WEB_ORIGIN=${corsWebOrigin}
      - WEB_PROTOCOL=https
      - WEB_ADDRESS=${authWebAddress}
      - HOOK_POST_VALIDATION_ARRAY=${authPostValidationHookArray}
      - WEB_RESET_ADDRESS=${authResetAddress}
      - WEB_PORT=${authPort}
      - DB_URI=mongodb://${authDBHost}:${authDBPort}/${authName}
      - MAIL_SMTP=${emailSMTP}
      - MAIL_USERNAME=${emailUser}
      - MAIL_PASSWORD=${emailPass}
      - MAIL_PHYSICAL=${emailPhysical}
      - ADMIN_DEFAULT_USERNAME=${defaultUser}
      - ADMIN_DEFAULT_HOSTNAME=${defaultHost}
      - ADMIN_DEFAULT_PASSWORD=${defaultPass}
      - SECRET_ACCESS=${accessToken}
      - SECRET_REFRESH=${refreshToken}
    volumes:
      - /etc/localtime:/etc/localtime:ro
    networks:
      - app-network
    depends_on:${ authDBHost != 'database' ? '' : `
      - database`}
      - traefik

  ${chatName}:
    image: krgamestudios/chat-server:latest
    ports:
      - ${chatPort}
    labels:
      - traefik.enable=true
      - traefik.http.routers.${chatName}router.rule=Host(\`${chatWebAddress}\`)
      - traefik.http.routers.${chatName}router.entrypoints=websecure
      - traefik.http.routers.${chatName}router.tls.certresolver=myresolver
      - traefik.http.routers.${chatName}router.service=${chatName}service@docker
      - traefik.http.services.${chatName}service.loadbalancer.server.port=${chatPort}
    environment:
      - WEB_ORIGIN=${corsWebOrigin}
      - WEB_PORT=${chatPort}
      - DB_URI=mongodb://${chatDBHost}:${chatDBPort}/${chatName}
      - SECRET_ACCESS=${accessToken}
    volumes:
      - /etc/localtime:/etc/localtime:ro
    networks:
      - app-network
    depends_on:${ chatDBHost != 'database' ? '' : `
      - database`}
      - traefik

${ [projectDBHost, newsDBHost, authDBHost, chatDBHost].some(x => x == "database") == false ? '' : `
  database:
    image: mongo:latest
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - /etc/localtime:/etc/localtime:ro
    networks:
      - app-network
`}
  traefik:
    image: traefik:latest
    container_name: traefik
    command:
      - --log.level=ERROR
      - --api.insecure=false
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.web.http.redirections.entryPoint.to=websecure
      - --entrypoints.web.http.redirections.entryPoint.scheme=https
      - --entrypoints.web.http.redirections.entrypoint.permanent=true
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.myresolver.acme.tlschallenge=true
      - --certificatesresolvers.myresolver.acme.email=${supportEmail}
      - --certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./letsencrypt:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /etc/localtime:/etc/localtime:ro
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
`;

	const dockerfile = `
FROM node:22-bookworm-slim
WORKDIR "/app"
COPY . /app
RUN mkdir -p /app/public
RUN chown node:node /app/public
RUN npm install --omit=dev
EXPOSE ${projectPort}
USER node
ENTRYPOINT ["bash", "-c"]
CMD ["sleep 10 && npm start"]
`;

	// MongoDB doesn't require initial SQL setup like MariaDB did
	// Databases are created automatically when first accessed

	fs.writeFileSync('docker-compose.yml', ymlfile);
	fs.writeFileSync('Dockerfile', dockerfile);
})()
	.then(() => rl.close())
	.catch(e => console.error(e))
;
