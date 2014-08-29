Documentation
-------------

Uses [dgeni](http://github.com/angular/dgeni), the wonderful documentation generator built by [@petebacondarwin](https://github.com/petebacondarwin).

To view docs:

1. `gulp docs`, which builds the docs to `dist/docs`
2. `cd dist/docs` and start an http server (e.g. `python -m SimpleHTTPServer`)
3. Navigate to the server, and enjoy (e.g. http://localhost:8000)

> Another solution is to use `npm install -g httpster` and then launch the HTTP server with with the command
```sh
httpster -p 8000 -d ./dist/docs
```

Then run `gulp watch` to watch and rebuild docs on every save.

#### Easy Debugging

Debugging directly in the Docs is complicated due to iFrames and multiple demos loading and initializing.

To open a demo outside of the Doc iframe(s), just navigate to component demo directly. For example, to debug the Toolbar demo and code, browser navigate to:

```sh
http://localhost:8000/generated/material.components.toolbar/demo/demo1/index.html
```
