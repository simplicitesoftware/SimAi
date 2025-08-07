
/* Specific client script */

(function($) {
	$(document).on("ui.loaded", function() {
		
		
		// customize UI here before home page	
	});

	$(document).on("ui.ready", function() {
		$("#header .header .actions .logged-scope").hide();
		// customize UI here
	
	});
	
	$(document).on("ui.beforeunload", function() {
		// window will be unloaded
	});
	
	$(document).on("ui.unload", function() {
		// window is unloaded
	});
})(jQuery);