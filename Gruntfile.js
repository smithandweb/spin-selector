'use strict';

module.exports = function (grunt) {

  // This is where we configure each task that we'd like to run.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      // This is where we set up all the tasks we'd like grunt to watch for changes.
      scripts: {
        files: ['src/js/*.js'],
        tasks: ['uglify'],
        options: {
          spawn: false
        }
      },
      css: {
        files: 'src/scss/*.scss',
        tasks: ['sass', 'autoprefixer'],
        options: {
          spawn: false
        }
      },
    },
    uglify: {
      options: {
        beautify: false,
        compress: true,
        mangle: true,
        sourceMap: true,
        preserveComments: false
      },
      my_target: {
        files: [
          {
            src: ['src/js/*.js'],
            dest: 'dist/spin-selector.min.js'
          }
        ]
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: 'src/scss/',
          src: '*.scss',
          dest: 'dist',
          ext: '.css'
        }]
      }
    },
    autoprefixer: {
      options: {
        browsers: ['> 1%', 'last 4 versions', 'Android >= 4', 'Firefox ESR', 'Opera 12.1'],
        map: true
      },
      multiple_files: {
        expand: true,
        flatten: true,
        src: 'dist/css/*.css',
        dest: 'dist/css/'
      },
    },
  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');

  grunt.file.setBase('.');

  grunt.registerTask('compile', ['sass', 'autoprefixer']);
  grunt.registerTask('minify', ['uglify']);
  grunt.registerTask('build', ['compile', 'minify']);

  return ['build'];
};
