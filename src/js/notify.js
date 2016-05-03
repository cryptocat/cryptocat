'use strict';
Cryptocat.Notify = {
	sounds: {
		loggingIn:    (new Audio('../snd/loggingIn.ogg')),
		loggedIn:     (new Audio('../snd/loggedIn.ogg')),
		buddyOnline:  (new Audio('../snd/buddyOnline.ogg')),
		buddyOffline: (new Audio('../snd/buddyOffline.ogg')),
		message:      (new Audio('../snd/message.ogg'))
	}
};

(function() {
for (var sound in Cryptocat.Notify.sounds) {
	if (hasProperty(Cryptocat.Notify.sounds, sound)) {
		Cryptocat.Notify.sounds[sound].load();
		Cryptocat.Notify.sounds[sound].volume = 0.5;
	}
}

Cryptocat.Notify.playSound = function(sound) {
	if (Cryptocat.Me.settings.sounds) {
		Cryptocat.Notify.sounds[sound].play();
	}
};

Cryptocat.Notify.showNotification = function(title, body, callback) {
	if (Cryptocat.Me.settings.notify) {
		var n = new Notification('Cryptocat: ' + title, {
			title: 'Cryptocat: ' + title,
			body: body,
			silent: true
		});
		n.onclick = callback;
	}
};
})();
