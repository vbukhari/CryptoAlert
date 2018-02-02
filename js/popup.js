$(function(){
	var storage = chrome.storage.local;
	
	$('.selectpicker').selectpicker({
	  style: 'btn-default',
	  size: 4
	});
	
	storage.get('coinDDLList', function (result) {
		_.each(result.coinDDLList, function(obj){
			$("#cryptCoinDDL").append('<option value="'+ obj.id +'">' + ' #' + obj.rank + ' ' + obj.name + ' <span>(' + obj.symbol + ')</span>' +'</option>').selectpicker('refresh');
		});

	});
	
	var chkAlertPrice = $("[name='my-checkbox']");
	chkAlertPrice.bootstrapSwitch({onColor: 'warning', size: 'mini'});
	
	storage.get(['isAlertSet', 'alertPrice'], function(coin){
		if(coin.isAlertSet && coin.alertPrice){
			$(".alertPrice").show();
		}
		else{ 
			$("#alertPrice").val('');
			$(".alertPrice").hide();
		}
		
		$("#alertPrice").val(coin.alertPrice);
		chkAlertPrice.bootstrapSwitch('state', coin.isAlertSet);
	});
	
	chkAlertPrice.on('switchChange.bootstrapSwitch', function(event, state) {
		if(state){
			$(".alertPrice").show();
		}
		else{
			$("#alertPrice").val('');
			$(".alertPrice").hide();
		}
	});

	$("#setAlertPrice").click(function(){
		var regex = /^[1-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/;
		var amount = $("#alertPrice").val();
		if(regex.test(amount)){
			var coinID = $("#cryptCoinDDL").val();
			storage.get('alertList', function(result){
				var alertList = [];
				if (_.isArray(result) && !_.isUndefined(result)) {
					alertList = _.map(result, function(item){
						if(item.alertCoinID == coinID){
							item.isAlertSet = chkAlertPrice.is(":checked");
							return item;
						}
					});
				} 
				else {
					alertList.push({alertCoinID: coinID, isAlertSet: chkAlertPrice.is(":checked"), alertPrice: $("#alertPrice").val()});
				}

				storage.set({"alertList": alertList});
				debugger;
			});
	
		}
		else{
			return false;
		}
	});
	
	$("#alertPrice").change(function(){
		storage.set({'alertPrice': $(this).val()}, function(){
			var notification = {
				type: 'basic',
				iconUrl: 'img/bitcoin_Icon48.png',
				title: 'Alert Set!',
				message: 'The alert for Bitcoin is set. You will be notify when the price reach the value.'
			};
			chrome.notifications.create("setBitAlertNotify", notification);
		});
	});

	$('.selectpicker').on('change', function(){
		updateCoin();
	});
	
	$("#buyCoin").click(function(e){
		e.preventDefault();
		chrome.tabs.create({url: "https://www.coinbase.com/"});
	});
	
	
	function updateCoin() {
		var selectedCoin = $("#cryptCoinDDL").val();
		if(selectedCoin)
			selectedCoinUrl ="https://api.coinmarketcap.com/v1/ticker/" + selectedCoin + "/";
		else
			selectedCoinUrl ="https://api.coinmarketcap.com/v1/ticker/bitcoin/";
		$.getJSON(selectedCoinUrl, 
		function(json){
			if(json){
		 	$.map(json, function(data){
				$("#price").text(data.price_usd);
				$("#change").text(data.percent_change_24h);
				$("#marketCap").text(data.market_cap_usd.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
				
				storage.get(['isAlertSet', 'alertPrice',], function(coin){
					if(data.price_usd <= coin.alertPrice && coin.isAlertSet )
					{
						var notification = {
							type: 'basic',
							iconUrl: 'img/cryptoIcon48.png',
							title: 'Bitcoin Set Price reached!',
							message: 'The Bigcoin price has reached your set price!'
						};
						chrome.notifications.create("setBitAlertNotify", notification);
					}
				});
			});
		 }
		 else{
			 $("#bitAlertDiv").hide();
			 $("#errorDiv").show();
		 }
    });
  }
  	updateCoin();
	setInterval(updateCoin, 30000);
});