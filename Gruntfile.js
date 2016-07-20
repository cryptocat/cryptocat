/* jshint quotmark: false */
'use strict';
var VERSION = '3.2.00';

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-electron');
	grunt.loadNpmTasks('grunt-electron-installer');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-jscs');

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
					'src/': ['src/package.json', 'src/js/version.js']
				},
				options: {
					replacements: [
						{
							pattern: /"version": "(\d|\.){5,8}"/,
							replacement: '"version": "' + VERSION + '"'
						},
						{
							pattern: /Cryptocat\.Version = '(\d|\.){5,8}';/,
							replacement: 'Cryptocat.Version = ' + '\'' + VERSION + '\';'
						}
					]
				}
			}
		},
		shell: {
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
			writeVer: 'gawk -vORS= \' BEGIN { print "' + VERSION + '" } \' > dist/version.txt',
			macWriteVer: 'echo ' + VERSION + ' > dist/version.txt'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [
				'src/app.js',
				'src/js/*.js',
				'src/js/win/*.js',
				'Gruntfile.js'
			]
		},
		jscs: {
			options: {
				config: '.jscsrc'
			},
			src: [
				'src/app.js',
				'src/js/*.js',
				'src/js/win/*.js'
			]
		}
	});

	grunt.registerTask('win', 'Create Windows Package', [
		'string-replace:dist',
		'electron:windows',
		'shell:winClean',
		'create-windows-installer:x64',
		'shell:writeVer'
	]);
	grunt.registerTask('linux', 'Create Linux Package', [
		'string-replace:dist',
		'electron:linux',
		'shell:linuxLogo',
		'shell:linuxClean',
		'shell:linuxZip',
		'shell:linuxRmDir',
		'shell:writeVer'
	]);
	grunt.registerTask('mac', 'Create Mac Package', [
		'string-replace:dist',
		'electron:mac',
		'shell:macMv',
		'shell:macClean',
		'shell:macWriteVer'
	]);
	grunt.registerTask('clean', 'Clean',
		['shell:cleanDist']
	);
	grunt.registerTask('ci', 'Verify Continuous Integration',
		['jshint', 'jscs']
	);
};
