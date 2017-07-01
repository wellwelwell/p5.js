'use strict';

var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var derequire = require('derequire');

module.exports = function(grunt) {

  grunt.registerMultiTask('modularise', 'Compile the modules with Browserify', function() {
    // Reading and writing files is asynchronous
    var done = this.async();

    // Module specific task details
    var module_name = this.target;
    var module_src = this.data;

    // Render the banner for the top of the file. Includes the Module name.
    var bannerTemplate = '/*! p5.' + module_name + '.js v<%= pkg.version %> <%= grunt.template.today("mmmm dd, yyyy") %> */';
    var banner = grunt.template.process(bannerTemplate);

    // Source file path
    var srcFilePath = [];
    for (var i = module_src.length - 1; i >= 0; i--) {
      var srcDirPath = './src/' + module_src[i];
      var files = fs.readdirSync(srcDirPath);
      files.map(function(r){
        if(r.substr(r.length-3,3) === '.js')
          srcFilePath.push(path.resolve(srcDirPath, r));
      });
    }
    console.log(srcFilePath);
    // Target file path
    var libFilePath = path.resolve('lib/modules/' + module_name + '.js');

    // Invoke Browserify programatically to bundle the code
    var bundle = browserify(srcFilePath, {
        standalone: 'p5'
        // debug: true
      })
      .transform('brfs')
      .bundle();

    // Start the generated output with the banner comment,
    var code = banner + '\n';

    // Then read the bundle into memory so we can run it through derequire
    bundle.on('data', function(data) {
      code += data;
    }).on('end', function() {
      grunt.file.write(libFilePath, derequire(code));

      // Print a success message
      grunt.log.writeln('>>'.green + ' Module ' + libFilePath.cyan + ' created.');

      // Complete the task
      done();
    });
  });
};
