const VERSION = '3.1.16';

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		electron: {
			windows: { options: {
				name: 'Cryptocat',
				dir: 'src',
				out: 'dist',
				platform: 'win32',
				arch: 'x64',
				icon: 'src/img/logo/logo',
				overwrite: true,
				prune: true,
				asar: true,
				'app-version': VERSION,
				'build-version': VERSION,
				'version-string': {
					CompanyName: 'Nadim Kobeissi',
					LegalCopyright: 'Copyright 2016 Nadim Kobeissi',
					FileDescription: 'Cryptocat',
					OriginalFilename: 'Cryptocat.exe',
					ProductName: 'Cryptocat',
					InternalName: 'Cryptocat.exe'
				}
			} },
			linux: { options: {
				name: 'Cryptocat',
				dir: 'src',
				out: 'dist',
				platform: 'linux',
				arch: 'x64',
				icon: 'src/img/logo/logo',
				overwrite: true,
				prune: true,
				asar: true,
				'app-version': VERSION,
				'build-version': VERSION
			} },
			mac: { options: {
				name: 'Cryptocat',
				dir: 'src',
				out: 'dist',
				platform: 'darwin',
				arch: 'x64',
				icon: 'src/img/logo/logo',
				overwrite: true,
				prune: true,
				asar: true,
				'app-version': VERSION,
				'build-version': VERSION,
				'app-bundle-id': 'com.cryptocat.cryptocat',
				'app-category-type': 'public.app-category.productivity'
			} }
		},
		'create-windows-installer': {
			x64: {
				appDirectory: 'dist/Cryptocat-win32-x64',
				outputDirectory: 'dist/Cryptocat-win32-x64-installer',
				noMsi: true,
				iconUrl: 'file://' + __dirname + '/src/img/logo/logo.ico',
				setupIcon: 'src/img/logo/logo.ico',
				loadingGif: 'src/img/logo/logo.gif'
			}
		},
		'string-replace': {
			dist: {
				files: {
					'src/': ['src/package.json', 'src/js/version.js'],
				},
				options: {
					replacements: [
						{
							pattern: /"version": "(\d|\.){5,8}"/,
							replacement: '"version": "' + VERSION + '"'
						},
						{
							pattern: /Cryptocat\.Version = '(\d|\.){5,8}';/,
							replacement: 'Cryptocat.Version = ' + "'" + VERSION + "';"
						}
					]
				}
			}
		},
		exec: {
			cleanDist: 'rm -rf dist/Cryptocat*',
			winClean: 'echo "GPLv3" > dist/Cryptocat-win32-x64/LICENSE',
			linuxLogo: 'cp src/img/logo/logo.png dist/Cryptocat-linux-x64/logo.png',
			linuxClean: 'rm -f dist/Cryptocat-linux-x64/LICENSE',
			macClean: 'rm -r dist/Cryptocat-darwin-x64',
			winZip: 'zip -jqr9 dist/Cryptocat-win32-x64 dist/Cryptocat-win32-x64-installer/Setup.exe',
			linuxZip: 'cd dist && zip -qr9 Cryptocat-linux-x64.zip Cryptocat-linux-x64',
			macMv: 'mv dist/Cryptocat-darwin-x64/Cryptocat.app dist/Cryptocat.app',
			macZip: 'cd dist && zip -qr9 Cryptocat-darwin-x64.zip Cryptocat.app',
			winRmDir: 'rm -r dist/Cryptocat-win32-x64 dist/Cryptocat-win32-x64-installer',
			linuxRmDir: 'rm -r dist/Cryptocat-linux-x64',
			macRmDir: 'rm -r dist/Cryptocat.app',
			winWriteVer: "awk -vORS= ' BEGIN { print \"" + VERSION + "\" } ' > dist/version.txt",
			writeVer: 'echo ' + VERSION + ' > dist/version.txt'
		}
	});

	grunt.loadNpmTasks('grunt-electron');
	grunt.loadNpmTasks('grunt-electron-installer');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-string-replace');

	grunt.registerTask('win', [
		'string-replace:dist',
		'electron:windows',
		'exec:winClean',
		'create-windows-installer:x64',
		'exec:winWriteVer'
	]);
	grunt.registerTask('linux', [
		'string-replace:dist',
		'electron:linux',
		'exec:linuxLogo',
		'exec:linuxClean',
		'exec:linuxZip',
		'exec:linuxRmDir',
		'exec:writeVer'
	]);
	grunt.registerTask('mac', [
		'string-replace:dist',
		'electron:mac',
		'exec:macMv',
		'exec:macClean',
		'exec:writeVer'
	]);
	grunt.registerTask('winZip', ['exec:winZip', 'exec:winRmDir']);
	grunt.registerTask('macZip', ['exec:macZip', 'exec:macRmDir']);
	grunt.registerTask('writeVersion', ['exec:writeVersion']);
	grunt.registerTask('clean', ['exec:cleanDist']);
};
