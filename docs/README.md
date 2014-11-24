Documentation
-------------

The Angular Material **Live Docs** are generated from the source code and demos; and, in fact, the Live Docs actually uses the Angular Material components and themes.

> Our build process uses **[dgeni](http://github.com/angular/dgeni)**, the wonderful documentation generator built by [Pete Bacon Darwin](https://github.com/petebacondarwin).

To view the Live Docs (locally):

1. Build the docs using `gulp docs`
2. Start an HTTP Server; the example below uses port 8000.
3. Run `gulp watch` to auto-rebuild docs (Optional)
4. Open browser at `http://localhost:8000`

```bash
# Build & deploy docs to `dist/docs`
# Watch source dirs for changes and rebuild

gulp docs
gulp watch

# Use the built-in gulp server with live reload
# or install httpster globally; if not already isntalled
# `npm install -g httpster`

gulp server

# And then launch webserver
# NOTE: unlike `gulp server` this will not auto-reload the HTML

httpster -p 8000 -d ./dist/docs
```


