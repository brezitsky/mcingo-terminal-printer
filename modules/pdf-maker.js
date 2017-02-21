const fs = require('fs');
const PDFDocument = require('pdfkit');
const PDFTable = require('voilab-pdf-table');
const child_process = require('child_process');

class PDFmaker {
	constructor() {
		this._columns = [
			{
				id: 'cabinet',
				header: 'Кабінет',
				width: 45,
				align: 'center'
			},
			{
				id: 'time',
				header: 'Час',
				width: 45,
				align: 'center'
			},
			{
				id: 'doctor',
				header: 'Лікар',
				width: 115,
				align: 'left'
			}
		]

		this.fonts = [
			'PFDinTextCompProLight_0',
			'pfDinTextCondPro_regular',
			'RobotoRegular_gdi',
			'Verdana_regular'
		]

		this._font = `./fonts/${this.fonts[1]}.ttf`;

		this._output = './pdf/test.pdf';

		this._printer = 'HP Universal Printing PCL 6';

		this._foxitFullPath = 'C:\\Program Files (x86)\\Foxit Software\\Foxit Reader\\FoxitReader.exe'

		this._pdfFullPath = 'C:\\DENWER\\home\\192.168.0.125\\www\\mc-terminal-printer\\pdf\\test.pdf'

		this._callback = () => {}
	}

	get columns() {
		return this._columns;
	}

	get font() {
		return this._font;
	}

	get output() {
		return this._output;
	}

	get printer() {
		return this._printer;
	}

	get foxit() {
		return this._foxitFullPath;
	}

	get pdf() {
		return this._pdfFullPath;
	}

	generateDate() {
		let date = new Date();

		let day = date.getDate()
		let month = date.getMonth()
		let year = date.getFullYear()
		let dayName = date.getDay()
		let hours = date.getHours()
		let minutes = date.getMinutes()
		let seconds = date.getSeconds()

		hours < 10 ? hours = `0${hours}` : false;
		minutes < 10 ? minutes = `0${minutes}` : false;
		seconds < 10 ? seconds = `0${seconds}` : false;

		let dayNameString = '';
		let monthNameString = '';

		switch (dayName) {
			case 0: dayNameString = 'Неділя'; break;
			case 1: dayNameString = 'Понеділок'; break;
			case 2: dayNameString = 'Вівторок'; break;
			case 3: dayNameString = 'Середа'; break;
			case 4: dayNameString = 'Четвер'; break;
			case 5: dayNameString = "П'ятниця"; break;
			case 6: dayNameString = 'Субота'; break;
			default:	console.log('unknown day number');
		}

		switch (month) {
			case 0: monthNameString = 'Січня'; break;
			case 1: monthNameString = 'Лютого'; break;
			case 2: monthNameString = 'Березня'; break;
			case 3: monthNameString = 'Квітня'; break;
			case 4: monthNameString = 'Травня'; break;
			case 5: monthNameString = 'Червня'; break;
			case 6: monthNameString = 'Липня'; break;
			case 7: monthNameString = 'Серпня'; break;
			case 8: monthNameString = 'Вересня'; break;
			case 9: monthNameString = 'Жовтня'; break;
			case 10: monthNameString = 'Листопада'; break;
			case 11: monthNameString = 'Грудня'; break;
			default: console.log('unknown month numver');
		}

		return {
			date: `${dayNameString}, ${day} ${monthNameString}, ${year}р.`,
			time: `${hours}:${minutes}:${seconds}`
		}
	}

	print(callback) {
		// let command = `"${this.foxit}" /t "${this.pdf}" "${this.printer}"`

		let command = ''

		child_process.exec(command, (err, stdout, stderr) => {
			if(err) {
				// console.log(err);
				callback(JSON.stringify({
					status: 'error',
					message: err
				}));
			}
			else {
				console.log(stdout);
				console.log(stderr);

				callback(JSON.stringify({
					status: 'success',
					message: stdout
				}));
			}
		})
	}

	init(json, callback) {

		// console.log(json);

		try {
			let doc = new PDFDocument({
				autoFirstPage: false,
				size: [227, 163 + json.doctorList.length * (5.95 * 2.8375)],
				margins: {
					top: 0, right: 10, bottom: 0, left: 10
				}
			})

			let table = new PDFTable(doc, {
				bottomMargin: 2
			})

			table.addPlugin(new (require('voilab-pdf-table/plugins/fitcolumn'))({
				column: 'description'
			}))

			table.setColumnsDefaults({
				headerBorder: 'B',
				align: 'right'
			})

			table.addColumns(this.columns)

			table.onPageAdded(function (tb) {
				tb.addHeader();
			});

			doc.addPage();

			doc.font(this.font)

			doc.image('./images/logo-big.png', (227/2 - 100/2), 5, {
				fit: [100, 100]
			})

			doc.moveDown(5.5)

			doc.fontSize(8)
			doc.text(`Доброго дня, ${json.user}!`, {
				align: 'center'
			})

			doc.moveDown(.3)
			doc.fontSize(7)
			doc.text('Дякуємо, що скористалися електронним сервісом.', {
				align: 'center'
			})
			doc.text('Нижче наведений список лікарів для відвідування:', {
				align: 'center'
			})

			doc.moveDown(1)

			table.addBody(json.doctorList);

			doc.fontSize(6)
			doc.text('Ви можете використати сервіс електронної реєстрації на Вашому смартфоні чи планшеті.', {
				align: 'center'
			})
			doc.text('Для цього підключіться до нашої WiFi мережі та відкрийте інтернет-браузер.', {
				align: 'center'
			})

			doc.moveDown(.5)
			doc.fontSize(5)
			let date = this.generateDate()

			doc.text(`${date.date}, ${date.time}`, {
				align: 'center'
			})


			doc.end();

			doc.pipe(fs.createWriteStream(this.output))

			// starting generate Image from PDF file
			doc.on('end', () => {
				console.log('done');

				this.print(callback);
			})
		}
		catch (e) {
			console.log(e);
		}
	}
}

module.exports = PDFmaker;
