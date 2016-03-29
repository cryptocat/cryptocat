Cryptocat.Patterns = {
	username:   /^([a-z0-9]|_){1,16}$/,
	password:   /^.{12,512}$/,
	version:    /^(\d){1,2}.(\d){1,2}.(\d){1,2}$/,
	sticker:    /^CryptocatSticker:\w{4,20}$/,
	deviceName: /^(\w|\s|\"|\'){1,24}$/,
	deviceIcon: /^(0|1|2)$/,
	dateTime:   /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
	hex32:      /^([0-9]|a|b|c|d|e|f){64}$/,
	hex64:      /^([0-9]|a|b|c|d|e|f){128}$/
};
