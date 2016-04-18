Cryptocat.Recording = {};

(function() {
	'use strict';
	var mediaRecorder = {};
	var mediaSource   = {};
	var sourceBuffer  = {};
	var recordedBlobs = [];
	
	Cryptocat.Recording.createStream = function(callback) {
		mediaSource = new MediaSource();
		mediaSource.addEventListener('sourceopen', function(e) {
			sourceBuffer = mediaSource.addSourceBuffer(
				'video/webm; codecs="vp8"'
			);
		}, false);
		navigator.webkitGetUserMedia({
			audio: true,
			video: true
		}, function(stream) {
			callback(stream);
			mediaRecorder = new MediaRecorder(stream, {
				mimeType: 'video/webm'
			});
			recordedBlobs = [];
			mediaRecorder.ondataavailable = function(e) {
				if (e.data && (e.data.size > 0)) {
					recordedBlobs.push(e.data);
				}
			};
			mediaRecorder.onstop = function(e) {
				var tracks = stream.getTracks();
				tracks.forEach(function(track) {
					track.stop();
				});
			};
		}, function(err) {});
		return false;
	}

	Cryptocat.Recording.start = function() {
		mediaRecorder.start(10);
		return true;
	};

	Cryptocat.Recording.stop = function(callback) {
		var fileReader = new FileReader();
		mediaRecorder.stop();
		fileReader.onload = function() {
			callback(new Buffer(this.result, 'binary'));
		};
		fileReader.readAsArrayBuffer(
			new Blob(recordedBlobs, {
				type: 'video/webm'
			})
		);
		return false;
	};

})();
