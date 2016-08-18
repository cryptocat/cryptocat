'use strict';

Cryptocat.Time = {
	getTimestamp: function(stamp) {
		var date = new Date(stamp);
		var h = date.getHours();
		var m = date.getMinutes();
		var d = date.getDate();
		var a = [
			'Jan', 'Feb', 'Mar',
			'Apr', 'May', 'Jun',
			'Jul', 'Aug', 'Sep',
			'Oct', 'Nov', 'Dec'
		][date.getMonth()];
		var t = (h > 11)? 'pm' : 'am';
		h = (h > 12)? (h - 12) : h;
		m = (m < 10)? (`0${m}`) : m;
		return `${d} ${a}., ${h}:${m}${t}`;
	}
};
