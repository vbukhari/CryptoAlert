$(function(){
	var storage = chrome.storage.local;
	var coinList = [];	
	var alertList = [];
	//https://files.coinmarketcap.com/generated/search/quick_search.json
	//https://api.coinmarketcap.com/v1/ticker/
	$.getJSON("https://api.coinmarketcap.com/v1/ticker/", function(json){
		if(json){
			$.map(json, function(coin){
				coinList.push(_.pick(coin, 'id', 'name', 'symbol', 'rank'));
			});
			storage.set({'coinDDLList': coinList, 'alertList': alertList});
		}
	});
	
	function update() {
		storage.get(['isAlertSet', 'alertCoinID', 'alertPrice'], function(result){
			var coinID = result.alertCoinID;
			debugger;
			if(result.isAlertSet){
				$.getJSON("https://api.coinmarketcap.com/v1/ticker/"+ coinID +"/", 
					function(json){
					 if(json){
						$.map(json, function(data){
							debugger;
							$("#price").text(data.price_usd);
							$("#change").text(data.percent_change_24h);
							$("#marketCap").text(data.market_cap_usd.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
							if(data.price_usd <= result.alertPrice )
							{
								var notification = {
									type: 'basic',
									iconUrl: 'img/cryptoIcon48.png',
									title: 'Bitcoin Set Price reached!',
									message: 'The '+ data.name +' price has reached your set price, Click button below to Buy/Sell your coins!'
								};
								chrome.notifications.create("setBitAlertNotify", notification);
							}
							
							$('.selectpicker').append('<option data-subtext="(' + data.symbol +')">' + data.name + '</option>');
						});
					 }
				});
			}
		});
	}
	setInterval(update, 5000);
	update();
});
