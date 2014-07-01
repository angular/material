Documentation
-------------

Uses [dgeni](http://github.com/angular/dgeni), the wonderful documentation generator built by [@petebacondarwin](https://github.com/petebacondarwin).

To view docs:

1. `gulp docs`
2. Start an HTTP server (eg `python -m SimpleHTTPServer`)
3. Navigate to http://localhost:8000/docs/app

Follow the same conventions as angularjs.  See checkbox.js directive for an example.

### Coming Soon

- Examples defined as separate folders in each component's file.  
  * `src/components/checkbox/superExample/{script.js,style.css,template.html,explain.md}`
- A properly styled docs site
