Documentation
-------------

The Angular Material **Live Docs** are generated from the source code and demos; and, in fact, the
Live Docs actually use the Angular Material components and themes.

> Our build process uses **[dgeni](https://github.com/angular/dgeni)**, the wonderful documentation
generator built by [Pete Bacon Darwin](https://github.com/petebacondarwin).

To view the Live Docs (locally):

1. Install the dependencies using `bower install`
2. Build the docs using `gulp docs`
3. Run `gulp watch` to auto-rebuild docs (optional)
4. Start an HTTP Server; the example below uses port 8080
5. Open browser at `http://localhost:8080`

```bash
# Build & deploy docs to `dist/docs`
gulp docs

# Watch source dirs for changes and rebuild
gulp watch

# Use the built-in gulp server with live reload
gulp server

# Alternatively, install httpster globally; if not already installed
npm install -g httpster

# And then launch the webserver
# NOTE: unlike `gulp server` this will not auto-reload the HTML
httpster -p 8080 -d ./dist/docs
```
