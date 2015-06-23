@ngdoc content
@name Typography
@description

Angular Material provides typography CSS classes you can use to create visual
consistency across your application.

[Reference the Material Design specification for Typography.](http://www.google.com/design/spec/style/typography.html)

<section class="demo-container">
  <md-toolbar class="demo-toolbar">
    <div class="md-toolbar-tools">
      <h3>Heading Styles</h3>
    </div>
  </md-toolbar>
  <div class="md-whiteframe-z1 docs-list">
    <p style="margin-top: 0;">To preserve <a href="http://webaim.org/techniques/semanticstructure/">semantic structures</a>, you should style the `<h1>` - `<h6>` heading tags with the styling classes shown below:</p>

	<div layout="row" class="docs-descriptions">
      <h4 class="md-body-1" flex="25" id="headings-selectors">Selectors</h4>
      <h4 class="md-body-1" id="headings-output">Output</h4>
    </div>
    <md-divider></md-divider>
    <ul>
      <li layout="column" layout-gt-md="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-display-4</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-display-4 docs-output">Light 112px</h5>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-display-3</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-display-3 docs-output">Regular 56px</h5>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-display-2</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-display-2 docs-output">Regular 45px</h5>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-display-1</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-display-1 docs-output">Regular 34px</h5>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-headline</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-headline docs-output">Regular 24px</h5>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-title</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-title docs-output">Medium 2.0sp</h5>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="headings-selectors">
          <code>.md-subhead</code>
        </span>
        <h5 aria-describedby="headings-output" class="md-subhead docs-output">Regular 16px</h5>
      </li>
    </ul>
    <h4 class="md-title">Example</h4>
    <hljs lang="html">
      <h1 class="md-display-3">Headline</h1>
      <h2 class="md-display-1">Headline</h2>
      <h3 class="md-headline">Headline</h3>
    </hljs>

	  <br/>
  <span class="md-body-1">
  	Note: Base font size is `10px` for easy rem units (1.2rem = 12px). Body font size is `14px`. sp = scalable pixels.
	</span>

  </div>

</section>

<section class="demo-container">
  <md-toolbar class="demo-toolbar">
    <div class="md-toolbar-tools">
      <h3>Body Copy</h3>
    </div>
  </md-toolbar>
  <div class="md-whiteframe-z1 docs-list">
    <div layout="row" class="docs-descriptions">
      <h4 class="md-body-1" flex="25" id="body-selectors">Selectors</h4>
      <h4 class="md-body-1" id="body-output">Output</h4>
    </div>
    <md-divider></md-divider>
    <ul>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="body-selectors">
          <code>.md-body-1</code><br>
        </span>
        <p class="docs-output md-body-1" aria-describedby="body-output">Regular 14px</p>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="body-selectors"><code>
          .md-body-2</code>
        </span>
        <p class="md-body-2 docs-output" aria-describedby="body-output">Medium 14px</p>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="body-selectors">
          <code>.md-button</code>
        </span>
        <div class="docs-output" aria-describedby="body-output">
    		  <md-button class="md-raised" style="margin-left:0; margin-right:0;">Medium 14px</md-button>
        </div>
      </li>
      <li layout="row" layout-align="start center">
        <span flex="25" class="docs-definition" aria-describedby="body-selectors">
          <code>.md-caption</code><br>
        </span>
        <div class="docs-output" aria-describedby="body-output">
          <small class="md-caption">Regular 12px</small>
        </div>
      </li>
    </ul>
    <h4 class="md-title">Examples</h4>
    <hljs lang="html">
      <p class="md-body-2">Body copy with medium weight.</p>
      <md-button>Button</md-button>
      <p class="md-body-1">Regular body copy <small class="md-caption">with small text</small>.</p>
      <span class="md-caption">Caption</span>
    </hljs>
  </div>
</section>
