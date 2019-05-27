module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			'dev/desktop.js': ['src/desktop/*.js'],
			'dev/desktop.css': ['src/desktop/*.css'],
		},

		copy: {
			'dev/desktop.html': 'src/desktop/desktop.html'
		},

		watch: {
			html: {
				files: ['src/desktop/desktop.html'],
				tasks: ['copy']
			},
			css: {
				files: ['src/desktop/desktop.css'],
				tasks: ['concat']
			},
			js: {
				files: ['src/desktop/*.js'],
				tasks: ['concat']
			}
		},

		browserSync: {
			dev: {
				bsFiles: {
					src: [
					 'dev/*.css',
					 'dev/*.js',
					 'dev/*.html'
					]
				},
				options: {
					watchTask: true,
					server: './dev'
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browser-sync');

	grunt.registerTask('default', [
		'browserSync',
		'watch'])
}