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
    concat: {
      options: {
        separator: ';',
      },
      appjs: {
        src: ['../app/**/*.js'],
        dest: '../prod/js/app.js',
      },
      vendorjs: {
        src: ['bower_components/angular/angular.min.js','bower_components/angular-route/angular-route.min.js', 'bower_components/jquery/dist/jquery.min.js', 
              'bower_components/bootstrap/dist/js/bootstrap.min.js','bower_components/angular-xeditable/dist/js/xeditable.min.js', 'bower_components/angular-bootstrap/ui-bootstrap.min.js',
              'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js','bower_components/spin.js/spin.js', 'bower_components/angular-spinner/angular-spinner.min.js',
              'bower_components/moment/min/moment.min.js','bower_components/angularMultipleSelect/build/multiple-select.min.js','bower_components/firebase/firebase.js',
              'bower_components/ngPrint/ngPrint.min.js'],
        dest: '../prod/js/vendor.js'
      },
      vendorcss: {
        src: ['bower_components/bootswatch-dist/css/bootstrap.min.css','bower_components/angularMultipleSelect/build/multiple-select.min.css', 'bower_components/font-awesome/css/font-awesome.min.css',
              'bower_components/angular-xeditable/dist/css/xeditable.min.css', 'bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css'],
        dest: '../prod/css/vendor.css'
      }
    },
    ngAnnotate: {
      options: {
          singleQuotes: true
      },
      dist: {
          files: [{
            expand: true,
            src: ['../prod/js/app.js', '!../prod/js/*.annotated.js'],
            ext: '.annotated.js',
            extDot: 'last'
          }]
      }
    },
    babel: {
        options: {
            sourceMap: true,
            presets: ['es2015', 'babel-preset-es2015']
        },
        dist: {
            files: [{
              "expand": true,
              "cwd": "lib/",
              "src": ["../prod/js/app.annotated.js"],
              "dest": "../prod/js/",
              "ext": ".js"
          }]
        }
    },
    copy: {
      partials: {
        files: [
          {expand: true, cwd: '../', src: ['partials/**'], dest: '../prod/'}
        ],
      },
      css: {
        files: [
          {expand: true, cwd: '../', src: ['css/main.css'], dest: '../prod/'}
        ]
      },
      awesomefonts: {
        files: [
          {expand: true, cwd: './bower_components/font-awesome/', src: ['fonts/**'], dest: '../prod/css/'}
        ]
      },
      bootstrapfonts: {
        files: [
          {expand: true, cwd: './bower_components/bootswatch-dist/', src: ['fonts/**'], dest: '../prod/'}
        ]
      }
    },
    processhtml: {
      dist:{
        files: {
          '../prod/index.html' : ['../index.html']
        }
      } 
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('default', ['jshint', 'sass', 'watch']);
  grunt.registerTask('prod', ['sass', 'concat','ngAnnotate', 'babel', 'copy', 'processhtml']);
};
