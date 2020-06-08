# Editable Demos in CodePen

## Description

Users can click a button on each demo to open it in CodePen
for editing. From there the user can edit, save, or make other
modifications to the example.

## Why CodePen?

CodePen appears to be one the most stable and active online sandboxes.
It offers a more accessible experience compared to other tools.

## How does it work?

Clicking **'Edit on CodePen'** creates a new CodePen instance that includes all HTML, CSS, and
JavaScript assets via the [CodePen API](http://blog.codepen.io/documentation/api/prefill).
We append an additional script to the new CodePen to initialize the
[cache](#asset_cache), which is responsible for serving assets.

## As a contributor, what do I need to know?

* [SVG images are served from a cache](#asset_cache)
* [Adding a new SVG requires a change to the asset cache](#build_cache)
* Anytime adding a new dependency to an example, the [svg-assets-cache.js](../app/svg-assets-cache.js)
  will need to be updated with the new dependency and [uploaded to the CDN](#update_cdn)
* Images used in demos must use full paths
* Code examples are modified prior to sending to CodePen with the same
  module defined in the [svg-assets-cache.js](../app/svg-assets-cache.js)
* Additional HTML template files located in the demo directory are appended to your index file
  using `ng-template`. [See docs](https://docs.angularjs.org/api/ng/directive/script)

## <a name="asset_cache"></a> Asset Cache

We store SVG images in an asset cache using `$templateCache`. We send a script to CodePen that
initializes the cache within the demo module.

### Why is an asset cache needed for CodePen?

Components within AngularJS Material, at times, use icons or SVG images. Images
fetched over HTTP, without having a server that will allow cross
site scripting (`Access-Control-Allow-Origin: *`), will fail with a
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) error.

We use the asset cache to bypass HTTP requests for images by instead serving the cached content.

### <a name="build_cache"></a> How do I populate the cache?

* Make all changes necessary to add or update any SVG images
* Run `./scripts/build-asset-cache.sh | pbcopy` to add an object literal to your paste buffer.
* Paste object literal as `var assetMap = { ... }` in the [svg-assets-cache.js](../app/svg-assets-cache.js)
* [Update](#update_cdn) the CDN with the new script
* Commit [svg-assets-cache.js](../app/svg-assets-cache.js)

### <a name="update_cdn"></a> Update CodePen Asset Cache

CDN is located on the CodePen PRO account.

* Refer to the [instructions](https://blog.codepen.io/documentation/asset-hosting/#asset-manager)
  on how to edit the `svg-assets-cache.js` file.
* "Edit" and "Save" the `svg-assets-cache.js` file.
  * This has been verified to work even though we no longer have a Pro account.
* The URL should remain the same.
* You will not be able to upload a new script since we no longer have a Pro account.

## Deployment Considerations

The step to generate and deploy the `svg-assets-cache.js` is currently a
manual process. Keep in mind, you need to follow the steps for [building](#build_cache) and
[updating](#update_cdn) the asset cache on the CDN when making any changes to a SVG image used by
a demo or, the docs site.
