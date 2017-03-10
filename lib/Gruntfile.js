module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      options: {
        predef: [ "document", "console", "$"],
        esnext: true,
        globalstrict: true,
        debug: true,
        globals: {"angular": true, "app": true, "firebase": true, "moment": true}
      },
      files: ['../app/**/*.js']
    },
    sass: {
      dist: {
        files: {
          '../css/main.css': '../sass/main.scss'
        }
      }
    },
    watch: {
      javascripts: {
        files: ['../app/**/*.js'],
        tasks: ['jshint']
      },
      sass: {
        files: ['../sass/**/*.scss'],
        tasks: ['sass']
      }
    },
    ngAnnotate: {
      options: {
          singleQuotes: true
      },
      dist: {
          files: [{
            expand: true,
            src: ['../app/**/*.js', '!./app/**/*.annotated.js'],
            ext: '.annotated.js',
            extDot: 'last'
          }]
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['jshint', 'sass', 'watch']);
  grunt.registerTask('prod', ['ngAnnotate']);
};
