/**
 * David Iglesias Sánchez
 * Rext framework
 * Basic reactive framework
 */
(function(_window) {
	function createTemplate(html) {
		this.template = {};
		// Variable name and variable textnode id
		this.variables = {};

	}
})(window);

/*
<template>
	<div class="menu_item">
		<div class="text left">{{name}}</div>
		<div class="text right">{{value}}</div>
		<input type="range" class="range" min="-0.8" max="0.8" value="0" step="0.01" data-item="exposure">
	</div>
</template>
*/