$(function(){
	
	$('.selectpicker').selectpicker({
	  style: 'btn-info',
	  size: 4
	});
	
	var chkAlertPrice = $("[name='my-checkbox']");
	chkAlertPrice.bootstrapSwitch({onColor: 'warning', size: 'mini'});
	
	chrome.storage.sync.get(['isAlertSet', 'alertPrice'], function(coin){
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
		chrome.storage.sync.set({'isAlertSet': state}, function(){
			if(state){
				$(".alertPrice").show();
			}
			else{
				$("#alertPrice").val('');
				$(".alertPrice").hide();
			}
		});
	});
	
	$("#alertPrice").change(function(){
		chrome.storage.sync.set({'alertPrice': $(this).val()}, function(){
			var notification = {
				type: 'basic',
				iconUrl: 'img/bitcoin_Icon48.png',
				title: 'Alert Set!',
				message: 'The alert for Bitcoin is set. You will be notify when the price reach the value.'
			};
			chrome.notifications.create("setBitAlertNotify", notification);
		});
	});
	

	
	$("#buyCoin").click(function(e){
		e.preventDefault();
		chrome.tabs.create({url: "https://www.coinbase.com/"});
	});
	
	function update() {
      $.getJSON("https://api.coinmarketcap.com/v1/ticker/bitcoin/", 
      function(json){
		 if(json){
		 	$.map(json, function(data){
				$("#price").text(data.price_usd);
				$("#change").text(data.percent_change_24h);
				$("#marketCap").text(data.market_cap_usd.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"));
				
				chrome.storage.sync.get(['isAlertSet', 'alertPrice'], function(coin){
					if(data.price_usd <= coin.alertPrice && coin.isAlertSet )
					{
						var notification = {
							type: 'basic',
							iconUrl: 'img/bitcoin_Icon48.png',
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
  	update();
	setInterval(update, 30000);
	//update();
});