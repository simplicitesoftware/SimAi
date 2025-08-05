
/* Specific client script */

(function($) {
	$(document).on("ui.loaded", function() {
		$("#menu").hide();
		$("#header .header .main-nav-toggle").hide();
		$("#header .header .index").hide();
		$("#header .header .actions div:not(.logged-user) .btn-group").hide();
		$("#header .header .actions .logged-scope").hide();
		$("#header .header .actions .shortcuts-bar").hide();

		// customize UI here before home page	
	});

	$(document).on("ui.ready", function() {
		$("#header .header .actions .undoredo").hide();
		// customize UI here
	
	});
	
	$(document).on("ui.beforeunload", function() {
		// window will be unloaded
	});
	
	$(document).on("ui.unload", function() {
		// window is unloaded
	});
})(jQuery);