'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    manifest: grunt.file.readJSON('manifest.json'),
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      js: {
        src: ['js/**/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.js.src %>',
        tasks: ['jshint:js']
      },
      coffee: {
        files: ['coffee/**/*.coffee'],
        tasks: ['coffee:compile']
      }
    },
    coffee: {
      compile: {
        expand: true,
        cwd: 'coffee/',
        src: ['**/*.coffee'],
        dest: 'js/',
        ext: '.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // Default task.
  grunt.registerTask('default', ['jshint']);

};
