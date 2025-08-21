/*
	This External Object is meant to complete what's inside SaiContact's form (Business Object).
*/
Simplicite.UI.ExternalObjects.SaiContactDashboard = class extends Simplicite.UI.ExternalObject {
	async render(params, data = {}) {
		
		let introText = $("<div/>").html( $T("SAI_CONTACT_INTRO") );
		let cards = $("<div/>").attr("id","saicontactdashboard-cards");
		
		this.createCards(cards);
		
		$("#saicontactdashboard")
			.append(introText)
			.append(cards);
		// This suppose that the actual form is reworked to ONLY CONTAIN the information input !
		
		console.log("Having moduleName : "+ toto);
	}
	
	createCards(container) {
		let gridContainer = $("<div/>").addClass("dashboard-card-container");
		
		let timeCard = $(`
			<div class="dashboard-card util-card">
				<div class="dashboard-card-header">
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGuSURBVHgB7ZcxUsMwEEU/hAOYLqW4gblB0tEFTuDkBEBHl3ADcgLMCQInSOgoww1cugwdVLA7XjMejy2tpFCRN6ORbK13v7TK2gH+O0cugzRNR9SNEMaWeEaoAAo+p26BOG5JxAMCBXzLcEdtCT+uqSX8LAk47TM6gZ2dOCnIyQIekPgJdy67Y8f8VnoDf0zLR5CAF+kTOYwqxDaRyxwRAnJUaWDm0DOVvqD2ajMc2CbLsvwcDodfNLygZmhc0L132zO0ej58d3K5jPoZNpyuUdUC3o1Zn1PZ+rVcbshuDAeuFNRcodpOzuuKAmUdwbNGcLadQYFKAK2EVz4Wx0wuRaoOzuO8EXxMzxQa36oUNAIZVKs0cquucDchwb0F9IhAaHBGewZ+kQBdZfnJN3iQACHBnvAWICnIOqYymfMi9hC2KfBXh1ARPEiEthIaZfCmiHOpH1a0Z+ARfq9ktl1pDAcuA6lyU/jDL68Penm92Yxcn2QGflvfhlNwZkuFKwWjiOAM14upzcAlIEM8E0QIcH5UKkhjBOyDJEbAPeKx+tD8NbtEeCr4s2yDAxZ+AMQjiyhNi79AAAAAAElFTkSuQmCC"/>
					<span>${this.getTimeMetric()}</span>
				</div>
				<div>${$T("SAI_DASHBOARD_TIME")}</div>
			</div>
		`);
		
		let tokenCard = $(`
			<div class="dashboard-card util-card">
				<div class="dashboard-card-header">
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJPSURBVHgB5VfBUeNAEGzd3eN+5/v5KSJAjgA5AxOBIQIgAuQM8I8fdgSQAeLHU0Rg8fMPyIBpaRbWQhK7kqqogq5qFpB2Z3a2Z3YE/HQETQ+iKBrJEPJX4T/hf330JHwUPmdZlmJIB9ToXDhTwyOHNVLhSpxZowMCyziNXjkarUMuTHwd+a3Gz2W4FP5Fd9Dx2Xg8ftlut/euk37peIThcO7zsnEgx3B49nnZOHA8kBO5cOozoZoFRyhDGMIP3PVSeCEi9IpAbR0QR2IZyAOU4ooqxsgMZT246V0PxOAcX4RAHWB1464S4Z3sKEcHaCGLsRuxtC1CxoELGU6s/zO8d8KN8AHvYSeKQiWLZhXDnH+K+kKWC1fCZVUjdiVM4JbDXGBioiTzuNtruAmXc6Z2hE0ackeJDHvCNdpTcmEZDz2MQ9+71XkF2m7DWIZ9dYq3oQn9ofXOBv4pS1AX0zcHZCFeQgsf8WnNuEJ38ChScwS8CTeyKMMzt0PUgr6pW8z/o3+codxNrOQOc5RaMFlA2JUuRj/E/GFngYua93hMGqENekLWCuwsICg4iuOzTBgMRoRhnQC1wJjWjLwxR6DVs2v3RHDDE6MBim8l49p2RI2lTQugnw6KSmo3JAnKTLjWTIg+WWCJfih6x7cjkOEW9QLMsXsXHFrHwDkx/MEumk1QGQEN+0S4wEfxhSh1ECtPrWddOqlc7RRoakhmamwfH78PqpdRiObo1RnfuYwCOEIzYtSSLYzMvMGRxpbN2QFXWJcYP+WYqg9DfMJ9X7wCh37p51tgyFgAAAAASUVORK5CYII="/>
					<span>${this.getTokenMetric()}</span>
				</div>
				<div>${$T("SAI_DASHBOARD_TOKENS")}</div>
			</div>
		`);
		
		let priceCard = $(`
			<div class="dashboard-card info-card">
				<div class="dashboard-card-header">
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIASURBVHgB5VftdcIwDLx0gdIJmg2aTlA6QekEwATABMAEbScAJoBOgJmAMAHeAEaoRJxXx/lwlJL+4d4TCYpsnW1JtoFbR4A/IoqikB5dktBSn0gOcRwrX/tGBMhphx4jkjFJx2O+JFmVkREREDp2sSGZEBHdiICZ6i2yU90ETOJTRICcR8Z50agVktEdLB3b9UheUEx4RiTmtQhUjPzLdHT2tB/QY1rQ/pXj4g5+uM7PpvHY55xBNku2J9HOp3v+qSRA7EclzhUEMIH3TLIyKkWy45fAcjZAfpr6jk5bnRThSM6qvucQWM4XuA5EM5QuQYjrIZIYpwSWyAdJE2gkKVkbmTQ0KcfgPN5bnxTJEB64VU5MwCFytFTf1HkPLaBOHWCc0BLSLOApXyMbjKFjq+HHhmZqAgHaSMOhqX61kC6BdGutgmi57ErIW+QTfgmFyBNTqMaORj9DEwIuTFwcHRKZvbwJOMPsdA08xnzy+bBU6WYUQ+44DfQukoDmfnRlGprR2s64ky11JqoJpq7sjXMG/x/wS5068I5sCl5GQp0urMpZ5rhDMjXOXdtLoZMcydYo3rQU8kcytuM2fRRn2DwN1v8+lHIMTew6Ib4XEJEZkjOeFApJkdK2sunFJERyN3hD9YzwiHl5rnMxKSETGRKPJA9GrZFkj65zcL1t/ABL5rUwnT5AYwAAAABJRU5ErkJggg=="/>
					<span>${this.getPriceMetric()}</span>
				</div>
				<div>${$T("SAI_DASHBOARD_PRICE")}</div>
			</div>
		`);
		
		let electricityCard = $(`
			<div class="dashboard-card eco-card">
				<div class="dashboard-card-header">
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFoSURBVHgB7ZbLUcMwEIZ/HgXAzUenA1ECFVAC7gA6QKkAcuQGFVBChgowFaCjj6YDdifyjKwkzu7K5JRvZifyxp7992HJwIkZcM7VZI8wcI558GTPLARKigVQ0IZ+7slC27YBSooExIyf4uU3DJRW4IGsjusPGDALiNmng3f0CqyTNfe/hQGTAMqe+14nLlP2JgGx9D5zm/pvEoBx6Qc+YeRMczNlz1P/krl7sps9j/Q0Gj0muIQ8eI3x1A9ckf3seYyDX2MCTQs8xoMn4f3QDSIByXarIWC7XVscnAEKziX+gj77hvo/SwXyd17CmyS4VEADHYFsKb1Z8hYssJn0HPatd/y30hzLqn0ghWbDYTMbKXwmLKCg5DByO3y3UFIi4C67Xh77iyitAJfew4D1OObgdeJSl75IAMbZryylLxUw9D9AsN3+h4ChAr4ke5OAeCyzibfbKS6gpOu6vqqqX1q+8honCvkDrcNcy3w1vr4AAAAASUVORK5CYII="/>
					<span>${this.getElectricityMetric()}</span>
				</div>
				<div>${$T("SAI_DASHBOARD_ELECTRICITY")}</div>
			</div>
		`);
		
		let carbonCard = $(`
			<div class="dashboard-card eco-card">
				<div class="dashboard-card-header">
					<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGRSURBVHgB7VfRUcMwDH1wDNAR0gkIG7gTFDaACVomIJ0AMkHpBGUDygR0A8IGGYHnRD1CLrGcxOar707nXGL7PcmS7QBnRESaprdan0tEAskTNk9av2gCiOdaRyXkfwWQ1Hp+Cv+1q+8VwhInbLY003g9R2wBNs5slrQ1bdb6PEMMAeS0E69Qe2swEoMFNIi7vI0rgOQG9RonCATvKiC59fp9BPknpgoQ8peez0fawTH8G1MESGl1kZe0B3k2PcPLIwEHfHJg2/GuoC1oe6vRMfYDCpwREO8NuslXCrnFHlME9BAsRNRaGVsw+jsEFvDKSQt4nHLEo0efwYdRzmW5h16KGwp9QwABZeO5kIw20MkzeEKrgmYJFdL2Ha9VWfp6foIzApzsgN8oFNK2938rckObDyW38NkHcvxNup2IqHZAScrRuNA6yOn3hToHbhAYahWQ1C5BXmtJJx+/gwWIiAx1yLXNJ44AwR1tqd1yowmQZLMifHZBb6hJ2IZEwC5FJvkxCYP/CyQS9n5gcEYA/AAJmGzzPRaw2AAAAABJRU5ErkJggg=="/>
					<span>${this.getCarbonMetric()}</span>
				</div>
				<div>${$T("SAI_DASHBOARD_CARBON")}</div>
			</div>
		`);
		
		gridContainer
			.append(timeCard)
			.append(tokenCard)
			.append(priceCard)
			.append(electricityCard)
			.append(carbonCard);
		
		container.append(gridContainer);
	}
	
	getTimeMetric() {
		// TODO : implement properly
		return "5m32s";
	}
	
	getTokenMetric() {
		// TODO : implement properly
		return "1430";
	}
	
	getPriceMetric() {
		// TODO : implement properly
		return "1.18€";
	}
	
	getCarbonMetric() {
		// TODO : implement properly
		return "0.85kg";
	}
	
	getElectricityMetric() {
		// TODO : implement properly
		return "3.47kWh";
	}
};
