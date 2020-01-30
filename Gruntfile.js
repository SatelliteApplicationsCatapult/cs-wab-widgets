module.exports = function (grunt) {
    'use strict';
    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-babel');
    var appDir = 'TODO - AFTER CREATING AN APP, PLEASE PUT PATH HERE AND INSERT ENTRY IN SYNC.MAIN.FILES BELOW.';
    var stemappDir = 'C:/arcgis-web-appbuilder-2.14/WebAppBuilderForArcGIS/client/stemapp';
    grunt.initConfig({
        sync: {
            main: {
                verbose: true,
                files: [{
                        cwd: 'dist/',
                        src: '**',
                        dest: stemappDir
                    }]
            }
        },
        babel: {
            'options': { 'sourceMap': true },
            'main': {
                'files': [{
                        'expand': true,
                        'src': [
                            'widgets/*.js',
                            'widgets/**/*.js',
                            'widgets/**/**/*.js',
                            'widgets/!**/**/nls/*.js',
                            'themes/*.js',
                            'themes/**/*.js',
                            'themes/**/**/*.js',
                            'themes/!**/**/nls/*.js'
                        ],
                        'dest': 'dist/'
                    }]
            }
        },
        watch: {
            main: {
                files: [
                    'widgets/**',
                    'themes/**'
                ],
                tasks: [
                    'clean',
                    'babel',
                    'copy',
                    'sync'
                ],
                options: {
                    spawn: false,
                    atBegin: true,
                    livereload: true
                }
            }
        },
        copy: {
            'main': {
                'src': [
                    'widgets/**/**.html',
                    'widgets/**/**.json',
                    'widgets/**/**.css',
                    'widgets/**/images/**',
                    'widgets/**/nls/**',
                    'themes/**/**.html',
                    'themes/**/**.json',
                    'themes/**/**.css',
                    'themes/**/images/**',
                    'themes/**/nls/**',
                    'themes/**/layouts/**/*.*'
                ],
                'dest': 'dist/',
                'expand': true
            }
        },
        clean: { 'dist': { 'src': 'dist/*' } }
    });
    grunt.registerTask('default', ['watch']);
};