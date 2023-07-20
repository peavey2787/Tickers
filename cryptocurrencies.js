// cryptocurrencies.js
const cryptocurrencies = [
  {
    name: 'Kaspa',
    symbol: 'KAS',
    endpoint: 'https://api.kaspa.org/info/price',
    hashEndpoint: 'https://api.kaspa.org/info/hashrate?stringOnly=false',
    baseCurrency: 'USD'
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    baseCurrency: 'USD'
  },
  {
    name: 'Ergo',
    symbol: 'Erg',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=ergo&vs_currencies=usd',
    baseCurrency: 'USD'
  },
  {
    name: 'Zilliqa',
    symbol: 'ZIL',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=zilliqa&vs_currencies=usd',
    baseCurrency: 'USD'
  },
  {
    name: 'Stellar',
    symbol: 'XLM',
    endpoint: 'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd',
    baseCurrency: 'USD'
  }
];
