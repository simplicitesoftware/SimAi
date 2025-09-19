// added by "addExtraJs"
// const moduleName = '_';

var introText = $("<div/>").html( $T("SAI_DASHBOARD_INTRO") );

var cards = $("<div/>").attr("id","saicontactdashboard-cards");

// creating cards
var gridContainer = $("<div/>").addClass("dashboard-card-container");

var st = new SaiTools(
	{
		_authToken: $grant.authtoken
	});

var historyMetrics = st.getTokensHistory(moduleName).then((result) => {
	var parsedMetrics = parseHistoryMetrics(result);
	// Shall check if there's a payload ...
	/*
	{
		time: _,
		tokens: _,
		price: _,
		electricity: _,
		carbon: _,
	}
	*/
		
	var timeCard = $(`
		<div class="dashboard-card util-card">
			<div class="dashboard-card-header">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGuSURBVHgB7ZcxUsMwEEU/hAOYLqW4gblB0tEFTuDkBEBHl3ADcgLMCQInSOgoww1cugwdVLA7XjMejy2tpFCRN6ORbK13v7TK2gH+O0cugzRNR9SNEMaWeEaoAAo+p26BOG5JxAMCBXzLcEdtCT+uqSX8LAk47TM6gZ2dOCnIyQIekPgJdy67Y8f8VnoDf0zLR5CAF+kTOYwqxDaRyxwRAnJUaWDm0DOVvqD2ajMc2CbLsvwcDodfNLygZmhc0L132zO0ej58d3K5jPoZNpyuUdUC3o1Zn1PZ+rVcbshuDAeuFNRcodpOzuuKAmUdwbNGcLadQYFKAK2EVz4Wx0wuRaoOzuO8EXxMzxQa36oUNAIZVKs0cquucDchwb0F9IhAaHBGewZ+kQBdZfnJN3iQACHBnvAWICnIOqYymfMi9hC2KfBXh1ARPEiEthIaZfCmiHOpH1a0Z+ARfq9ktl1pDAcuA6lyU/jDL68Penm92Yxcn2QGflvfhlNwZkuFKwWjiOAM14upzcAlIEM8E0QIcH5UKkhjBOyDJEbAPeKx+tD8NbtEeCr4s2yDAxZ+AMQjiyhNi79AAAAAAElFTkSuQmCC"/>
				<span>${parsedMetrics.time}</span>
			</div>
			<div>${$T("SAI_DASHBOARD_TIME")}</div>
		</div>
	`);
		
	var tokenCard = $(`
		<div class="dashboard-card util-card">
			<div class="dashboard-card-header">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJPSURBVHgB5VfBUeNAEGzd3eN+5/v5KSJAjgA5AxOBIQIgAuQM8I8fdgSQAeLHU0Rg8fMPyIBpaRbWQhK7kqqogq5qFpB2Z3a2Z3YE/HQETQ+iKBrJEPJX4T/hf330JHwUPmdZlmJIB9ToXDhTwyOHNVLhSpxZowMCyziNXjkarUMuTHwd+a3Gz2W4FP5Fd9Dx2Xg8ftlut/euk37peIThcO7zsnEgx3B49nnZOHA8kBO5cOozoZoFRyhDGMIP3PVSeCEi9IpAbR0QR2IZyAOU4ooqxsgMZT246V0PxOAcX4RAHWB1464S4Z3sKEcHaCGLsRuxtC1CxoELGU6s/zO8d8KN8AHvYSeKQiWLZhXDnH+K+kKWC1fCZVUjdiVM4JbDXGBioiTzuNtruAmXc6Z2hE0ackeJDHvCNdpTcmEZDz2MQ9+71XkF2m7DWIZ9dYq3oQn9ofXOBv4pS1AX0zcHZCFeQgsf8WnNuEJ38ChScwS8CTeyKMMzt0PUgr6pW8z/o3+codxNrOQOc5RaMFlA2JUuRj/E/GFngYua93hMGqENekLWCuwsICg4iuOzTBgMRoRhnQC1wJjWjLwxR6DVs2v3RHDDE6MBim8l49p2RI2lTQugnw6KSmo3JAnKTLjWTIg+WWCJfih6x7cjkOEW9QLMsXsXHFrHwDkx/MEumk1QGQEN+0S4wEfxhSh1ECtPrWddOqlc7RRoakhmamwfH78PqpdRiObo1RnfuYwCOEIzYtSSLYzMvMGRxpbN2QFXWJcYP+WYqg9DfMJ9X7wCh37p51tgyFgAAAAASUVORK5CYII="/>
				<span>${parsedMetrics.tokens}</span>
			</div>
			<div>${$T("SAI_DASHBOARD_TOKENS")}</div>
		</div>
	`);
		
	var priceCard = $(`
		<div class="dashboard-card info-card">
			<div class="dashboard-card-header">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIASURBVHgB5VftdcIwDLx0gdIJmg2aTlA6QekEwATABMAEbScAJoBOgJmAMAHeAEaoRJxXx/lwlJL+4d4TCYpsnW1JtoFbR4A/IoqikB5dktBSn0gOcRwrX/tGBMhphx4jkjFJx2O+JFmVkREREDp2sSGZEBHdiICZ6i2yU90ETOJTRICcR8Z50agVktEdLB3b9UheUEx4RiTmtQhUjPzLdHT2tB/QY1rQ/pXj4g5+uM7PpvHY55xBNku2J9HOp3v+qSRA7EclzhUEMIH3TLIyKkWy45fAcjZAfpr6jk5bnRThSM6qvucQWM4XuA5EM5QuQYjrIZIYpwSWyAdJE2gkKVkbmTQ0KcfgPN5bnxTJEB64VU5MwCFytFTf1HkPLaBOHWCc0BLSLOApXyMbjKFjq+HHhmZqAgHaSMOhqX61kC6BdGutgmi57ErIW+QTfgmFyBNTqMaORj9DEwIuTFwcHRKZvbwJOMPsdA08xnzy+bBU6WYUQ+44DfQukoDmfnRlGprR2s64ky11JqoJpq7sjXMG/x/wS5068I5sCl5GQp0urMpZ5rhDMjXOXdtLoZMcydYo3rQU8kcytuM2fRRn2DwN1v8+lHIMTew6Ib4XEJEZkjOeFApJkdK2sunFJERyN3hD9YzwiHl5rnMxKSETGRKPJA9GrZFkj65zcL1t/ABL5rUwnT5AYwAAAABJRU5ErkJggg=="/>
				<span>${parsedMetrics.price} €</span>
			</div>
			<div>${$T("SAI_DASHBOARD_PRICE")}</div>
		</div>
	`);
		
	var electricityCard = $(`
		<div class="dashboard-card eco-card">
			<div class="dashboard-card-header">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFoSURBVHgB7ZbLUcMwEIZ/HgXAzUenA1ECFVAC7gA6QKkAcuQGFVBChgowFaCjj6YDdifyjKwkzu7K5JRvZifyxp7992HJwIkZcM7VZI8wcI558GTPLARKigVQ0IZ+7slC27YBSooExIyf4uU3DJRW4IGsjusPGDALiNmng3f0CqyTNfe/hQGTAMqe+14nLlP2JgGx9D5zm/pvEoBx6Qc+YeRMczNlz1P/krl7sps9j/Q0Gj0muIQ8eI3x1A9ckf3seYyDX2MCTQs8xoMn4f3QDSIByXarIWC7XVscnAEKziX+gj77hvo/SwXyd17CmyS4VEADHYFsKb1Z8hYssJn0HPatd/y30hzLqn0ghWbDYTMbKXwmLKCg5DByO3y3UFIi4C67Xh77iyitAJfew4D1OObgdeJSl75IAMbZryylLxUw9D9AsN3+h4ChAr4ke5OAeCyzibfbKS6gpOu6vqqqX1q+8honCvkDrcNcy3w1vr4AAAAASUVORK5CYII="/>
				<span>${parsedMetrics.electricity} kWh</span>
			</div>
			<div>${$T("SAI_DASHBOARD_ELECTRICITY")}</div>
		</div>
	`);
		
	var carbonCard = $(`
		<div class="dashboard-card eco-card">
			<div class="dashboard-card-header">
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGRSURBVHgB7VfRUcMwDH1wDNAR0gkIG7gTFDaACVomIJ0AMkHpBGUDygR0A8IGGYHnRD1CLrGcxOar707nXGL7PcmS7QBnRESaprdan0tEAskTNk9av2gCiOdaRyXkfwWQ1Hp+Cv+1q+8VwhInbLY003g9R2wBNs5slrQ1bdb6PEMMAeS0E69Qe2swEoMFNIi7vI0rgOQG9RonCATvKiC59fp9BPknpgoQ8peez0fawTH8G1MESGl1kZe0B3k2PcPLIwEHfHJg2/GuoC1oe6vRMfYDCpwREO8NuslXCrnFHlME9BAsRNRaGVsw+jsEFvDKSQt4nHLEo0efwYdRzmW5h16KGwp9QwABZeO5kIw20MkzeEKrgmYJFdL2Ha9VWfp6foIzApzsgN8oFNK2938rckObDyW38NkHcvxNup2IqHZAScrRuNA6yOn3hToHbhAYahWQ1C5BXmtJJx+/gwWIiAx1yLXNJ44AwR1tqd1yowmQZLMifHZBb6hJ2IZEwC5FJvkxCYP/CyQS9n5gcEYA/AAJmGzzPRaw2AAAAABJRU5ErkJggg=="/>
				<span>${parsedMetrics.carbon} g</span>
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
			
	cards.append(gridContainer);
		
	$("#saicontactdashboard")
		.append(introText)
		.append(cards);
});

// UTIL FUNCTIONS
function parseHistoryMetrics(data) {
	let metrics = JSON.parse(data.payload);
    
	let _time = calculateDuration(metrics);
	let _tokens = calculateTokens(metrics);
	let _cost = calculateCost(metrics);
	let _electricity = calculateEnergy(metrics);
	let _carbon = calculateCO2(metrics);
	
	return {
		time: _time,
		tokens: _tokens,
		price: _cost,
		electricity: _electricity,
		carbon: _carbon
	};
}

function calculateDuration(data) {
    const beginTime = new Date(data.begin);
    const endTime = new Date(data.end);
    
    const durationMs = endTime - beginTime;
    const durationSeconds = Math.floor(durationMs / 1000);
    
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;
    
    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function calculateTokens(data) {
    let totalTokens = 0;
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    
    data.tokens.forEach(usage => {
        totalTokens += usage.total_tokens;
        totalPromptTokens += usage.prompt_tokens;
        totalCompletionTokens += usage.completion_tokens;
    });
    
    return totalTokens;
}

function calculateCost(data) {
    // Mistral Medium 3 pricing (as of 2025 estimates)
    const INPUT_PRICE_PER_1M = 0.34; // €
    const OUTPUT_PRICE_PER_1M = 1.7; // €
    
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    
    data.tokens.forEach(usage => {
        totalPromptTokens += usage.prompt_tokens;
        totalCompletionTokens += usage.completion_tokens;
    });
    
    const inputCost = (totalPromptTokens / 1000000) * INPUT_PRICE_PER_1M;
    const outputCost = (totalCompletionTokens / 1000000) * OUTPUT_PRICE_PER_1M;
    
    return parseFloat((inputCost + outputCost).toFixed(2));
}

function calculateEnergy(data) {
    // Industry estimates for LLM energy consumption
    // ~0.5 Wh per 1000 tokens (varies significantly by model size and hardware)
    const ENERGY_PER_1K_TOKENS = 0.0005; // kWh per 1000 tokens
    
    let totalTokens = 0;
    
    data.tokens.forEach(usage => {
        totalTokens += usage.total_tokens;
    });
    
    const energyConsumption = (totalTokens / 1000) * ENERGY_PER_1K_TOKENS;
    
    return parseFloat(energyConsumption.toFixed(3));
}

function calculateCO2(data) {
    // energy consumption
    const energyKWh = calculateEnergy(data);
    
    // Global average grid carbon intensity: ~475g CO2 per kWh
    // (This varies significantly by region - cloud providers often use cleaner energy)
    const CARBON_INTENSITY_G_PER_KWH = 475;
    
    const carbonEmissions = energyKWh * CARBON_INTENSITY_G_PER_KWH;
    
    return parseFloat(carbonEmissions.toFixed(2));
}














