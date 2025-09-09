
/* Specific client script */

(function($) {
	$(document).on("ui.loaded", function() {
		
		
		// customize UI here before home page	
	});

	$(document).on("ui.ready", function() {
		$("#header .header .actions .logged-scope").hide();
		$("#header .header .actions").prepend('<div id="custom-timer"></div>');
		
		let scope = $grant.scope.home;
		let obj = $grant.getTmpObject("SaiContact");
		
		obj.search((rows) => {
			let deleteDate = parseUTCDate(rows[0].saiCntDeletion);
			
			function updateTimer() {
				let now = new Date();
				let diffTime = deleteDate - now;
				
				if (diffTime > 0) {
					let hours = Math.floor(diffTime / (1000 * 60 * 60));
					let minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
					let seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
					
					let timeString = hours.toString().padStart(2, '0') + "h" + minutes.toString().padStart(2, '0') + "m" + seconds.toString().padStart(2, '0') + "s";
					
					// Afficher en rouge si moins de 10 minutes
					if (diffTime < (10 * 60 * 1000)) { // 10 minutes en millisecondes
						$("#custom-timer").html(`${$T("SAI_TIME")} <span style="color: red; font-weight: bold;">${timeString}</span>`);
					} else {
						$("#custom-timer").html(`${$T("SAI_TIME")} ${timeString}`);
					}
				} else {
					$("#custom-timer").html(`${$T("SAI_TIME")} 00h00m00s`);
					clearInterval(timerInterval);
					window.location.replace($app.getExternalObjectURL("SaiEndOfTime",{},true));
					
				}
			}
			
			let timerInterval = setInterval(updateTimer, 1000);
			
			updateTimer();
			
			
		});
		
		// customize UI here
	
	});
	function parseUTCDate(dateString) {
		// Format: "YYYY-MM-DD HH:mm:ss"
		// On remplace l'espace par 'T' et on ajoute 'Z' pour indiquer UTC
		return new Date(dateString.replace(' ', 'T') + 'Z');
	}
	
	$(document).on("ui.beforeunload", function() {
		// window will be unloaded
	});
	
	$(document).on("ui.unload", function() {
		// window is unloaded
	});
})(jQuery);