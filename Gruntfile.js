/* jshint quotmark: false */
'use strict';
var VERSION = '3.2.05';
var ELECTVR = '1.3.3';

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
				version: ELECTVR,
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
				version: ELECTVR,
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
				version: ELECTVR,
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
				iconUrl: `file://${__dirname}/src/img/logo/logo.ico`,
				setupIcon: 'src/img/logo/logo.ico',
				loadingGif: 'src/img/logo/logo.gif'
			}
		},
		'string-replace': {
			src: {
				files: {
					'src/': ['src/package.json', 'src/js/version.js']
				},
				options: {
					replacements: [
						{
							pattern: /"version": "(\d|\.){5,8}"/,
							replacement: `"version": "${VERSION}"`
						},
						{
							pattern: /Cryptocat\.Version = '(\d|\.){5,8}';/,
							replacement: `Cryptocat.Version = '${VERSION}';`
						}
					]
				}
			},
			dist: {
				files: {
					'dist/': ['dist/version.txt']
				},
				options: {
					replacements: [
						{
							pattern: /.+/,
							replacement: VERSION
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
			macRmDir: 'rm -r dist/Cryptocat.app'
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
		'string-replace:src',
		'string-replace:dist',
		'electron:windows',
		'shell:winClean',
		'create-windows-installer:x64'
	]);
	grunt.registerTask('linux', 'Create Linux Package', [
		'string-replace:src',
		'string-replace:dist',
		'electron:linux',
		'shell:linuxLogo',
		'shell:linuxClean',
		'shell:linuxZip',
		'shell:linuxRmDir'
	]);
	grunt.registerTask('mac', 'Create Mac Package', [
		'string-replace:src',
		'string-replace:dist',
		'electron:mac',
		'shell:macMv',
		'shell:macClean'
	]);
	grunt.registerTask('winZip', 'Archive Windows Package',
		['shell:winZip', 'shell:winRmDir']
	);
	grunt.registerTask('macZip', 'Archive Mac Package',
		['shell:macZip', 'shell:macRmDir']
	);
	grunt.registerTask('clean', 'Clean',
		['shell:cleanDist']
	);
	grunt.registerTask('ci', 'Verify Continuous Integration',
		['jshint', 'jscs']
	);
};
