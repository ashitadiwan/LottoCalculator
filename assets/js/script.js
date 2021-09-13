// Helper Functions

// Get Date for datetime-local input field
const dateForDateTimeInputValue = (date = new Date()) => {
  return new Date(date.getTime() + new Date().getTimezoneOffset() * -60 * 1000)
    .toISOString()
    .slice(0, 16);
};

const dateFromDateTimeInputValue = (dateString) => {
    var b = dateString.split(/\D+/);
    return new Date(b[0], --b[1], b[2], b[3], b[4], b[5]||0, b[6]||0);
}

// Find the next closest day
const findClosestDay = (ind, arr) => {
  var a = [...Array(7).keys()];
  var n = 7;

  for (var i = ind; i < n + ind; i++) {
    var day = a[parseInt(i % n)];
    if (arr.includes(day)) {
      return day;
    }
  }
};

// function to find next draw date
const getNextLottoDraw = (refDate = new Date()) => {
    var refDayofWeek = refDate.getDay();
    var dayOfWeek = findClosestDay(refDayofWeek, [3, 6]);

    if (dayOfWeek < 0) return;
    refDate.setHours(20, 0, 0, 0);
    refDate.setDate(
        refDate.getDate() +
        ((dayOfWeek + 7 - refDayofWeek) % 7)
    );
    return refDate;
}

// function to convert date into specified formatted string
const getDateString = (date, time = false) => {
  var timeString = !!time ? " " + date.toTimeString().slice(0, 5) : "";
  return date.toLocaleDateString().split("/").join("-") + timeString;
}

// function to fetch price based on date
const fetchPrice = async (date = null) => {
  var apiParam = "https://api.coingecko.com/api/v3/coins/bitcoin";

  if (date) {
    apiParam += "/history?date=" + getDateString(date);
  }

  const response = await fetch(apiParam);
  return await response.json(); //extract JSON from the http response
};

// Get a constant price for today
fetchPrice().then(responseToday => {
  const price = responseToday.market_data.current_price.eur;


  // Step 1 : Set the default date to today's date
  document.querySelector("#draw-datetime").value = dateForDateTimeInputValue();


  // Step 2: Get draw date on submit action
  document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    var date = dateFromDateTimeInputValue(document.querySelector("#draw-datetime").value);
    var drawDate = getNextLottoDraw(date);

    // Step 3: Get bitcoin value using fetch api
    if (new Date() - drawDate >= 0) {
        fetchPrice(drawDate).then(response => {
          var diff = Number((((responseToday.market_data.current_price.eur - response.market_data.current_price.eur) * 100) / response.market_data.current_price.eur)).toFixed(2);
          var euro = Number(100 + +diff).toFixed(2);
          document.getElementsByTagName("tbody")[0].innerHTML = "<tr><td>" + getDateString(date, true) + "</td><td>" + euro + "</td></tr>"
        });
    }  
    else{
      document.getElementsByTagName("tbody")[0].innerHTML = "<tr><td>" + getDateString(date, true) + "</td><td>-</td></tr>"
    }
  });

});


