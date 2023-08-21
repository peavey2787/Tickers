
async function getCryptoPrice(endpoint,cryptoId) {
  try {
    const response = await fetch(endpoint, { mode: 'cors' });
    const data = await response.json();

    let price = 0.0;
    
    try {
      price = data[`${cryptoId.toLowerCase()}`].usd;
    }
    catch {
      price = data.price;
    }
    
    return price;

  } catch (error) {
    console.error('Error fetching cryptocurrency price:', error);
    return null;
  }
}

async function getNetworkHashrate(cryptoConfig) {

  let hash = 0.0;

  if(cryptoConfig.hashEndpoint) {
    try {
      const response = await fetch(cryptoConfig.hashEndpoint);

      const data = await response.json();

      if(data.hashrate) {

	hash = (data.hashrate / 1000).toFixed(2) + " PH/s";

      } else if(data[0].network_hashrate) {

        hash = data[0].network_hashrate;
	hash = convertToMiningUnit(hash);

      } else {

        //console.log('got network hashrate');
	//console.log('data: ' + data);
      }

    } catch (error) {
        console.error('Error fetching cryptocurrency price:', error);
      return hash;
    }
  } 

  	
  return hash;
}

function convertToMiningUnit(number) {
  const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
  let unitIndex = 0;

  while (number >= 1000 && unitIndex < units.length - 1) {
    number /= 1000;
    unitIndex++;
  }

  return number.toFixed(2) + ' ' + units[unitIndex];
}

function createCryptoWidget(cryptoConfig) {
  const cryptoWidgetsContainer = document.getElementById('cryptoWidgetsContainer');
  const cryptoContainer = document.createElement('div');
  cryptoContainer.classList.add('widget_box');
  cryptoContainer.classList.add(`${cryptoConfig.name.toLowerCase()}`);

  const logo = document.createElement('img');
  logo.src = `images/${cryptoConfig.name.toLowerCase()}.png`;
  logo.alt = `${cryptoConfig.name} logo`;
  logo.classList.add('logo');
  cryptoContainer.appendChild(logo);  

  const priceValue = document.createElement('span');
  priceValue.id = `price_${cryptoConfig.name}`;
  priceValue.textContent = ' 0.00000 ';
  cryptoContainer.appendChild(priceValue);

  const updateStatus = document.createElement('span');
  updateStatus.id = `update_${cryptoConfig.name}`;
  updateStatus.textContent = ' updating... ';
  cryptoContainer.appendChild(updateStatus);

  const intervalCountDownLabel = document.createElement('span');
  intervalCountDownLabel.id = `count_${cryptoConfig.name}`;
  intervalCountDownLabel.textContent = '90';
  cryptoContainer.appendChild(intervalCountDownLabel);

  cryptoContainer.appendChild(document.createElement('div'));

  const networkHashrateLabel = document.createElement('span');
  networkHashrateLabel.textContent = 'Network Hashrate: ';
  cryptoContainer.appendChild(networkHashrateLabel);

  const networkHashrate = document.createElement('span');
  networkHashrate.id = `netHash_${cryptoConfig.name}`;
  networkHashrate.textContent = ' 0.0 h/s ';
  cryptoContainer.appendChild(networkHashrate);


  // Show More
  const showMoreButton = document.createElement('button');
  showMoreButton.id = `showMore_${cryptoConfig.name}`;
  showMoreButton.className = 'btn btn-primary';
  showMoreButton.type = 'button';
  showMoreButton.textContent = 'Show More';
  cryptoContainer.appendChild(showMoreButton);

  const showMoreDiv = document.createElement('div');
  showMoreDiv.classList.add('show-more');

  const cryptoToUsdLabel = document.createElement('div');
  cryptoToUsdLabel.textContent = `${cryptoConfig.symbol} to ${cryptoConfig.baseCurrency}:`;
  showMoreDiv.appendChild(cryptoToUsdLabel);

  const toUsdButton = document.createElement('input');
  toUsdButton.setAttribute('type', 'radio');
  toUsdButton.setAttribute('name', `${cryptoConfig.name}-conversionType`);
  toUsdButton.setAttribute('id', `toUsdButton_${cryptoConfig.name}`);
  toUsdButton.checked = true;
  showMoreDiv.appendChild(toUsdButton);

  const cryptoToUsdInput = document.createElement('input');
  cryptoToUsdInput.setAttribute('type', 'number');
  cryptoToUsdInput.setAttribute('id', `toUsdInput_${cryptoConfig.name}`);
  showMoreDiv.appendChild(cryptoToUsdInput);

  const usdToCryptoLabel = document.createElement('div');
  usdToCryptoLabel.textContent = `${cryptoConfig.baseCurrency} to ${cryptoConfig.symbol}:`;
  showMoreDiv.appendChild(usdToCryptoLabel);

  const toCryptoButton = document.createElement('input');
  toCryptoButton.setAttribute('type', 'radio');
  toCryptoButton.setAttribute('name', `${cryptoConfig.name}-conversionType`);
  toCryptoButton.setAttribute('id', `toCryptoButton_${cryptoConfig.name}`);
  showMoreDiv.appendChild(toCryptoButton);

  const usdToCryptoInput = document.createElement('input');
  usdToCryptoInput.setAttribute('type', 'number');
  usdToCryptoInput.setAttribute('id', `toCryptoInput_${cryptoConfig.name}`);
  showMoreDiv.appendChild(usdToCryptoInput);

  const refreshIntervalLabel = document.createElement('div');
  refreshIntervalLabel.textContent = `Refresh Interval: `;
  showMoreDiv.appendChild(refreshIntervalLabel);

  const refreshIntervalInput = document.createElement('input');
  refreshIntervalInput.setAttribute('id', `refresh_${cryptoConfig.name}`);
  refreshIntervalInput.setAttribute('type', 'number');
  refreshIntervalInput.setAttribute('value', '90');
  refreshIntervalInput.classList.add('refreshInput');
  showMoreDiv.appendChild(refreshIntervalInput);


  showMoreDiv.style.display = 'none';
  cryptoContainer.appendChild(showMoreDiv);
  cryptoWidgetsContainer.appendChild(cryptoContainer);

  let refreshIntervalId;
  let currentInterval = parseInt(refreshIntervalInput.value, 10);




  async function updateCryptoPrice(update_status = false) {

    const priceValue = document.getElementById(`price_${cryptoConfig.name}`);
    const updateStatus = document.getElementById(`update_${cryptoConfig.name}`);
    const toUsdInput = document.getElementById(`toUsdInput_${cryptoConfig.name}`);
    const toCryptoInput = document.getElementById(`toCryptoInput_${cryptoConfig.name}`);
    const toUsdChecked = document.getElementById(`toUsdButton_${cryptoConfig.name}`).checked;
    const toCryptoChecked = document.getElementById(`toCryptoButton_${cryptoConfig.name}`).checked;
    const netHashrate = document.getElementById(`netHash_${cryptoConfig.name}`);

    if(update_status) {
      updateStatus.textContent = ' updating... ';
      await delay(1000);
    }

    // Get network hashrate
    const netHash = await getNetworkHashrate(cryptoConfig);
    if (!netHash.startsWith("0")) {
        netHashrate.textContent = netHash;
    }

    // Get price
    try {
      const price = await getCryptoPrice(cryptoConfig.endpoint, cryptoConfig.name);

      if (price) {
        priceValue.textContent = '$' + parseFloat(price).toString();

        const cryptoToUsdValue = parseFloat(toUsdInput.value);
        const usdToCryptoValue = parseFloat(usdToCryptoInput.value);

        if (toUsdChecked && !isNaN(cryptoToUsdValue)) {
          const usdEquivalent = cryptoToUsdValue * price;
          usdToCryptoInput.value = usdEquivalent.toFixed(2);
        }

        if (toCryptoChecked && !isNaN(usdToCryptoValue)) {
          const cryptoEquivalent = usdToCryptoValue / price;
          cryptoToUsdInput.value = cryptoEquivalent.toFixed(8);
        }

	if(update_status) {
          updateStatus.textContent = ' updated ';
	  await delay(1000);
          updateStatus.textContent = ' refresh in ';
	}

      } else {
	// Reload the current page
	location.reload();
        //updateStatus.textContent = ' Error ';
      }
    } catch (error) {
      console.error('An error occurred:', error);
      updateStatus.textContent = 'Error';
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function startAutoRefresh() {

    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
    }

    currentInterval = parseInt(refreshIntervalInput.value, 10);

    refreshIntervalId = setInterval(() => {
      currentInterval--;
      intervalCountDownLabel.textContent = `${currentInterval}`;

      if (currentInterval === 0) {
        currentInterval = parseInt(refreshIntervalInput.value, 10);
        updateCryptoPrice();
      }
    }, 1000);
  }

  refreshIntervalInput.addEventListener('change', startAutoRefresh);

  cryptoToUsdInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      toUsdButton.setAttribute('checked', true);
      updateCryptoPrice();
    }
  });

  usdToCryptoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      toCryptoButton.setAttribute('checked', true);
      updateCryptoPrice();
    }
  });
  
  toUsdButton.addEventListener('input', () => {
    updateCryptoPrice();
  });

  toCryptoButton.addEventListener('input', () => {
    updateCryptoPrice();
  });

  showMoreButton.addEventListener('click', () => {
    if (showMoreDiv.style.display !== 'none') {
      showMoreDiv.style.display = 'none';
    } else {
      showMoreDiv.style.display = 'block';
    }
  });

  updateCryptoPrice(true);
  startAutoRefresh();
  
}

document.addEventListener('DOMContentLoaded', (event) => {
  const cryptoWidgetsContainer = document.getElementById('cryptoWidgetsContainer');

  try {
    for (const crypto of cryptocurrencies) {
      createCryptoWidget(crypto);
    }
  } catch (error) {
    console.error('Error loading cryptocurrencies:', error);
  }
});


