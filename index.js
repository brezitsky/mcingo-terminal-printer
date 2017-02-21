const http = require('http');
const url = require('url');
const qs = require('querystring');

const PDFmaker = require('./modules/pdf-maker.js');
const pdfMaker = new PDFmaker();

const server = http.createServer((request, response) => {
	let uri = url.parse(request.url);
	// console.log(uri.pathname);

	switch (uri.pathname) {
		case '/':
			if(request.method == 'POST') {
				let body = '';

				request.on('data', chunk => {
					// console.log(chunk);
					body += chunk.toString()
				})

				request.on('end', () => {
					let post = qs.parse(body);
					// console.log(post);

					let json = JSON.parse(post.json);
					// console.log(json);

					pdfMaker.init(json, output => {

						response.writeHead(200, {
							'Content-Type': 'text/plain',
							'Access-Control-Allow-Origin': '*'
						});
						response.end(output);
					})
				})
			}
			break;
		default:
			response.writeHead(404, {'Content-Type': 'text/plain'});
			response.end('404')
	}

})

server.listen(505, 'localhost');
