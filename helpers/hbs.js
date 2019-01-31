const moment = require('moment');

module.exports = {
	truncate: (str, len) => {
		if (str.length > len && str.length > 0) {
			let new_str = str + ' ';
			new_str = str.substr(0, len);
			new_str = str.substr(0, new_str.lastIndexOf(' '));
			new_str = (new_str.length > 0) ? new_str : str.substr(0, len);

			return new_str + '...';
		}

		return str;
	},

	stripTags: (input) => input.replace(/<(?:.|\n)*?>/gm, ''),
	formatDate: (date, formate) => moment(date).format(formate),
	select: (selected, options) => {
		return options.fn(this).replace( new RegExp(' value=\"' + selected + '\"'), '$& selected="selected"')
			.replace( new RegExp('>' + selected + '</option>'), ' selected="selected"$&');
	}
};