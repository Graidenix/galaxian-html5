module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            main: {
                src: 'index.js',
                dest: '../game.min.js',
                debug: true
            }
        },
        watch: {
            files: './**/*.js',
            tasks: ['default']
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['browserify', 'uglify']);
};