// app.js

const apiUrl = 'https://stocks3.onrender.com/api/stocks/getstocksdata';
const profileApiUrl = 'https://stocks3.onrender.com/api/stocks/getstocksprofiledata';

const Stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];

// Fetch stock data from the API
async function fetchStockData() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log('Stock Data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}

// Fetch stock profile data from the API
async function fetchStockProfileData(stockSymbol) {
  try {
    const response = await fetch(`${profileApiUrl}?symbol=${stockSymbol}`);
    const data = await response.json();
    console.log('Stock Profile Data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching stock profile data:', error);
  }
}

// Fetch stock stats data from the API
async function fetchStockStatsData() {
  try {
    const response = await fetch('https://stocks3.onrender.com/api/stocks/getstockstatsdata');
    const data = await response.json();
    console.log('Stock Stats Data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching stock stats data:', error);
  }
}

// Function to log stock stats data
async function logStockStatsData() {
  const stockStatsData = await fetchStockStatsData();
  console.log('Logging stock stats data:', stockStatsData);
}



// Modify renderStockStats function
function renderStockStats(stockStatsData) {
  const stockStatsElement = document.getElementById('stockStats');
  stockStatsElement.innerHTML = '';

  const stockStatsList = stockStatsData.stocksStatsData[0];
  Stocks.forEach(stockSymbol => {
    if (stockStatsList.hasOwnProperty(stockSymbol)) {
      const stockStatsItem = document.createElement('div');

      // Calculate profit percentage
      const profitPercentage = (stockStatsList[stockSymbol].profit / stockStatsList[stockSymbol].bookValue) * 100;

      // Check if profit is greater than zero
      if (stockStatsList[stockSymbol].profit > 0) {
        stockStatsItem.innerHTML = `
          <p>${stockStatsList[stockSymbol].bookValue} <span style="color: green; margin-left: 5px;"> ${profitPercentage.toFixed(2)}%</span></p>
        `;
      } else {
        // Profit is zero or less
        stockStatsItem.innerHTML = `
          <p>${stockStatsList[stockSymbol].bookValue} <span style="color: red; margin-left: 5px;">${profitPercentage.toFixed(2)}%</span></p>
        `;
      }

      stockStatsElement.appendChild(stockStatsItem);
    }
  });
}



// Render stock list
function renderStockList(stockData) {
  const stockListElement = document.getElementById('stockList');
  stockListElement.innerHTML = '';

  stockData.forEach(stock => {
    const stockItem = document.createElement('div');
    stockItem.textContent = stock.name;
    stockItem.classList.add('stock-item');

    stockItem.addEventListener('click', async () => {
      // Handle click event to change the chart and fetch stock profile data
      await changeChart(stock.symbol, '1mo');
      const profileData = await fetchStockProfileData(stock.symbol);
      renderStockProfileDetails(profileData, stock.symbol);
    });

    stockListElement.appendChild(stockItem);

    // Set the default selection to 'AAPL'
    if (stock.symbol === 'AAPL') {
      stockItem.click();
    }
  });
}

// Render stock details
function renderStockDetails(stock) {
  const stockDetailsElement = document.getElementById('stockDetails');
  stockDetailsElement.innerHTML = `
    <h2>${stock.name}</h2>
    <p>Profit: ${stock.profit}</p>
    <p>Book Value: ${stock.bookValue}</p>
    <p>Summary: ${stock.summary}</p>
  `;
}

// Render stock profile details
function renderStockProfileDetails(profileData, selectedStockSymbol) {
  const stockDetailsElement = document.getElementById('stockDetails');
  stockDetailsElement.innerHTML = '';

  // Check if the profileData is an object and not an array
  if (profileData && profileData.stocksProfileData && Array.isArray(profileData.stocksProfileData)) {
    const selectedStockData = profileData.stocksProfileData[0][selectedStockSymbol];

    if (selectedStockData && selectedStockData.summary) {
      const stockParagraph = document.createElement('p');
      stockParagraph.innerHTML = `<strong>${selectedStockSymbol}:</strong> ${selectedStockData.summary}`;
      stockDetailsElement.appendChild(stockParagraph);
    } else {
      stockDetailsElement.innerHTML = 'No summary data available for the selected stock.';
    }
  } else {
    stockDetailsElement.innerHTML = 'Invalid profile data format.';
  }
}

// Render chart
function renderChart(chartData) {
  const chartElement = document.getElementById('chart');
  // Use third-party charting library like Plotly.js or ChartJS to render the chart
  
  Plotly.newPlot(chartElement, [{
    x: chartData.timeStamp.map(timestamp => new Date(timestamp * 1000).toLocaleDateString()),
    y: chartData.value,
    type: 'line',
    name: 'Stock Value',
  }], { responsive: true });
}

// Modify createButtons function
function createButtons() {
  const buttonContainer = document.getElementById('buttonContainer');
  const existingButtons = document.querySelectorAll('.stock-button');

  // Check if buttons already exist and remove them
  existingButtons.forEach(button => button.remove());

  // Iterate through the Stocks array and create buttons
  Stocks.forEach(stockSymbol => {
    // Create container for each button and stock stats
    const buttonContainerDiv = document.createElement('div');
    buttonContainerDiv.classList.add('button-container');

    // Create button
    const button = document.createElement('button');
    button.classList.add('stock-button');
    button.textContent = stockSymbol;

    // Create stock stats container
    const statsContainer = document.createElement('div');
    statsContainer.classList.add('stock-stats');

    // Append the button and stock stats to the button container
    buttonContainerDiv.appendChild(button);
    buttonContainerDiv.appendChild(statsContainer);

    // Attach click event to call changeChart with the specified stock symbol
    button.addEventListener('click', async () => {
      // Assuming you want to use a default time range, e.g., '1mo'
      await changeChart(stockSymbol, '1mo');
      // Fetch and render stock profile data
      const profileData = await fetchStockProfileData(stockSymbol);
      renderStockProfileDetails(profileData, stockSymbol);
    });

    // Append the button container to the main button container
    buttonContainer.appendChild(buttonContainerDiv);
  });
}


// Call the createButtons function to generate buttons on page load
createButtons();

// Function to change the chart based on the selected stock and time range
async function changeChart(stockSymbol, timeRange) {
  try {
    const stockDataResponse = await fetchStockData();

    if (stockDataResponse.stocksData && Array.isArray(stockDataResponse.stocksData)) {
      const stockData = stockDataResponse.stocksData[0];

      // Check if the selected stock and the specified time range exist
      if (stockData && stockData[stockSymbol] && stockData[stockSymbol][timeRange]) {
        console.log(`Changing chart for ${stockSymbol} - ${timeRange}`);
        const selectedStockData = stockData[stockSymbol][timeRange];
        renderChart(selectedStockData);
      } else {
        console.error(`No data available for ${stockSymbol} - ${timeRange}`);
      }
    } else {
      console.error('Invalid stock data format:', stockDataResponse);
    }
  } catch (error) {
    console.error('Error changing chart:', error);
  }
}

// Initial setup
async function init() {
  console.log('Initializing app...');

  // Log stock stats data
  await logStockStatsData();

  const defaultStockSymbol = 'AAPL'; // Set the default stock symbol

  const stockDataResponse = await fetchStockData();
  const stockStatsData = await fetchStockStatsData();

  if (stockDataResponse.stocksData && Array.isArray(stockDataResponse.stocksData)) {
    const stockData = stockDataResponse.stocksData;

    console.log('Stock data:', stockData);

    renderStockList(stockData);

    // Assume initial 5-year chart data is available in the first stock's "5y" property
    const initial5YearData = stockData[0][defaultStockSymbol]['5y'];
   
    console.log('Rendering initial chart...');
    renderChart(initial5YearData);

    // Assume initial stock details are available in the first stock
    const initialStockDetails = stockData[0];
    console.log('Rendering initial stock details...');
    renderStockDetails(initialStockDetails);

    // Fetch and render stock profile data for the initial stock
    console.log('Fetching and rendering initial stock profile data...');
    const initialProfileData = await fetchStockProfileData(defaultStockSymbol);
    renderStockProfileDetails(initialProfileData, defaultStockSymbol);

    // Render stock stats
    console.log('Rendering stock stats...');
    renderStockStats(stockStatsData);
  } else {
    console.error('Invalid stock data format:', stockDataResponse);
  }
}

// Call the init function to set up the initial state
console.log('Calling init function...');
init();
