const fs = require('fs');
const https = require('https');
const path = require('path');

const compression = require('compression');
require('dotenv').config({
	path: path.join(path.resolve(__dirname, '..'), '.env'),
});
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const { name: appName, version: appVersion } = require('../package.json');

const app_port = process.env.APP_PORT || 8080;

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
	res.setHeader('Server', `${appName}_v${appVersion}`);
	next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/includes', express.static('www/includes'));

app.use('/', (req, res) => {
	res.sendFile('index.html', { root: 'www' });
});

const privateKey = fs.readFileSync(process.env.APP_PK_PATH || 'server.key');
const certificate = fs.readFileSync(process.env.APP_CERT_PATH || 'server.cert');

const accessLogStream = fs.createWriteStream(
	process.env.NODE_LOGS || 'access.log',
	{ flags: 'a' }
);

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

https
	.createServer({ key: privateKey, cert: certificate }, app)
	.listen(app_port, () =>
		console.log(`${appName} listening on port ${app_port}`)
	);
