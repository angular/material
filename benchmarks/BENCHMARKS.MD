## Benchpress Benchmarks

This document contains all necessary instructions for creating and adding new benchmarks for tunning the performance of
Angular Material Design.

### Before running the benchmarks
Make sure you're running node version >= 4.2.2!

```
$ npm install .
$ ./node_modules/.bin/webdriver-manager update #Installs chromedriver and selenium standalone
$ ./node_modules/.bin/protractor config/protractor.conf.js #runs benchmark spec and logs output
```

## See The Code
 * Benchmark code: [test-500-angular-buttons.html](test-500-angular-buttons.html), [app.js](app.js)
 * Benchmark spec: [initial-benchmark-spec.js](../test/initial-benchmark-spec.js)
 * Protractor config: [protractor.conf.js](../config/protractor.conf.js)
