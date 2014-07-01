
### Javascript Conventions

- 2 spaces for tabs
- Each component declares its own module at the top and leaks no variables
- Use the 'revealing pattern' when possible. API at top, function definitions at bottom.  See src/components/checkbox/checkbox.js
- JSHint conventions in progress

### Testing Conventions

- For testing, use `beforeEach` loops and global variables as little as possible.
  * Each test should have its own isolated logic, to make tests easier to read and more portable.

- For an example of the desired directive testing pattern, see `src/components/checkbox/checkbox.spec.js`
  * Create a `setup(attrs)` function which takes attributes to put on the directive
  * The `setup` function should register the module for the test and return the compiled directive element.
  * Use `el.scope()` and `el.isolateScope()` to access the element's scope.
