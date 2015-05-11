var util = require('../util');

exports.task = function() {
  var mod = util.readModuleArg();
  var name = mod.split('.').pop();
  var demoIndexTemplate = fs.readFileSync(
      root + '/docs/config/template/demo-index.template.html', 'utf8'
  ).toString();

  gutil.log('Building demos for', mod, '...');

  return utils.readModuleDemos(mod, function() {
    return lazypipe()
        .pipe(gulpif, /.css$/, sass())
        .pipe(gulpif, /.css$/, util.autoprefix())
        .pipe(gulp.dest, BUILD_MODE.outputDir + name)
    ();
  })
      .pipe(through2.obj(function(demo, enc, next) {
        fs.writeFileSync(
            path.resolve(BUILD_MODE.outputDir, name, demo.name, 'index.html'),
            _.template(demoIndexTemplate, demo)
        );
        next();
      }));

};
