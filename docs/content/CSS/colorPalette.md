@ngdoc content
@name TST Color Palette
@description

This is the color palette for the new user interface designs. The examples
are for use within a SASS file.

<style>
	.docs-output {
		height: 50px;
    	width: 50px;
	}
</style>

<section class="demo-container">
	<md-toolbar class="demo-toolbar">
		<div class="md-toolbar-tools">
			<h3>Colors</h3>
		</div>
	</md-toolbar>
	<div class="md-whiteframe-z1 docs-list">

		<div layout="row" class="docs-descriptions">
			<h4 class="md-body-1" flex="25">Selectors</h4>
			<h4 class="md-body-1">Output</h4>
		</div>

		<md-divider></md-divider>

		<ul>

			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Primary/Link/Notify</p>
					<code ng-non-bindable>{{primary-color}}</code><br/>
					<code ng-non-bindable>{{primary-500}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #4d91db"></h5>
				</span>
			</li>
			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Secondary</p>
					<code ng-non-bindable>{{primary-900}}</code>
					<code ng-non-bindable>{{primary-A700}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #183a5c"></h5>
				</span>
			</li>

			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Success</p>
					<code ng-non-bindable>{{accent-color}}</code><br/>
					<code ng-non-bindable>{{accent-500}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #00a45f"></h5>
				</span>
			</li>

			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Error</p>
					<code ng-non-bindable>{{warn-color}}</code><br/>
					<code ng-non-bindable>{{warn-500}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #cb191c"></h5>
				</span>
			</li>
			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Warning</p>
					<code ng-non-bindable>{{warn-A100}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #e7b81c"></h5>
				</span>
			</li>

			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Background Dark</p>
					<code ng-non-bindable>{{background-color}}</code><br/>
					<code ng-non-bindable>{{background-500}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #333839"></h5>
				</span>
			</li>
			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Seperator/Text</p>
					<code ng-non-bindable>{{background-900}}</code>
					<code ng-non-bindable>{{background-A700}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #000000"></h5>
				</span>
			</li>
			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Background</p>
					<code ng-non-bindable>{{background-50}}</code>
					<code ng-non-bindable>{{background-A100}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #ffffff"></h5>
				</span>
			</li>
			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Background/Text Alternative</p>
					<code ng-non-bindable>{{background-100}}</code>
					<code ng-non-bindable>{{background-A200}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #eeeeee"></h5>
				</span>
			</li>
			<li layout="column" layout-gt-md="row" layout-align="start center">
				<span flex="25" class="docs-definition" aria-describedby="color-coding">
					<p>Stroke</p>
					<code ng-non-bindable>{{background-200}}</code>
					<code ng-non-bindable>{{background-A400}}</code>
				</span>
				<span flex="75" aria-describedby="color-output">
					<h5 class="docs-output" style="background-color: #cccccc"></h5>
				</span>
			</li>

		</ul>

	</div>

</section>
