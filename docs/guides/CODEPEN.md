# Editable Demos in Codepen

## Description

Users will be able to click a button on each demo to open in codepen
to edit.  From there the user can edit, save or make other
modifications to the example.

## Why Codepen?

Codepen appears to be one the most stable and active online sandboxes.
It has less accessibility problems then some of the other tools.

## How does it work?

When the user clicks on the **'Edit on codepen'** button, all files including
html, css, js, templates are used to create the new codepen by posting
to the [Codepen API](http://blog.codepen.io/documentation/api/prefill/).  An
additional script is appended to the example to initialize the
[cache](#asset_cache), which is responsible for serving assets.

## As a contributor, what do I need to know?

* [SVG images are served from a cache](#asset_cache)
* [Adding a new SVG requires a change to the asset cache](#build_cache)
* Anytime a new dependency is added to an example, the [asset-cache.js](../app/asset-cache.js)
  will need to be updated with the new dependency and [uploaded to the
  CDN](#update_cdn)
* Images used in demos must use full paths
* Code examples are modified prior to sending to codepen with the same
  module defined in the [asset-cache.js](../app/asset-cache.js)
* Additional HTML template files located in the demo directory are appended to your index file using `ng-template`. [See docs](https://docs.angularjs.org/api/ng/directive/script)

## <a name="asset_cache"></a> Asset Cache

SVG images are stored in an asset cache using `$templateCache`.  A
script is delivered to codepen that initializes the cache within the
demo module.

### Why is an asset cache needed for Codepen?

Components within angular material at times use icons or SVG.  Images
are fetched over http.  Without having a server that will allow cross
site scripting (`Access-Control-Allow-Origin: *`), the request will
fail with a [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
error.

The asset cache is intended to bypass any http request for an image
and serve the cached content.

### <a name="build_cache"></a> How do I populate the cache?

* Make all changes necessary to add or update any svg images
* run `./scripts/build-asset-cache.sh | pbcopy` to add an object
  literal to your paste buffer.
* paste object literal as `var assetMap = { ... }` in the
  [asset-cache.js](../app/asset-cache.js)
* [update](#update_cdn) the CDN with the new script
* commit asset-cache.js

### <a name="update_cdn"></a> Update Codepen Asset Cache

CDN is located on the Codepen PRO account.

* Follow the [instructions](http://blog.codepen.io/documentation/pro-features/asset-hosting/#asset-manager) on how to update the script.
* NOTE: be sure to update the script. DO NOT upload a new script. The URL should remain the same

## Deployment Considerations

The step to generate and deploy the asset-cache.js is currently a
manual process.  Keep in mind that if changes are made to
asset-cache.js then you will need to follow the [steps](#update_cdn)
to update the cache on the CDN.
