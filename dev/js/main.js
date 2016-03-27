$.ajax({
    url: 'http://api.dronestre.am/data',
    type: 'GET',
    crossDomain: true,
    dataType: 'jsonp',
    success: function(data) { app(false, data); },
    error: function() { alert('Failed!'); }
});


mapboxgl.accessToken = 'pk.eyJ1IjoibW9penN5ZWQiLCJhIjoiY2lrcDhjdjZ2MTBneXYwa211ZzdtcDdueiJ9.lR2kw1QWbY9seFuIAnT0pg';

//Setup mapbox-gl map
   var map = new mapboxgl.Map({
     container: 'map', // container id
     style: 'mapbox://styles/moizsyed/cil5sg1z800989rm85z6ucyrp',
     center: [58.5500,19.6000],
     zoom: 3.7,

   })
   map.scrollZoom.disable()
   map.addControl(new mapboxgl.Navigation());

   // Setup our svg layer that we can manipulate with d3
   var container = map.getCanvasContainer()
   var svg = d3.select(container).append("svg")


   function project(d) {
     return map.project(getLL(d));
   }
   function getLL(d) {
     return new mapboxgl.LngLat(+d.lon, +d.lat)
   }

function app(error, data) {
  if (error) throw error;

  var totalStrikes = data.strike.length;
  var countries = [];
  var locations = [];
  var deathsMinTotal = 0;
  var deathsMaxTotal = 0;
  var deathsCivilians = 0;
  var deathsChildren = 0;
  var totalInjuries = 0;

  for (var i = 0; i < totalStrikes; i++) {
    if (countries.indexOf(data.strike[i].country) == -1) {
      countries.push(data.strike[i].country);
    }
  }
  for (var j = 0; j < totalStrikes; j++) {
    if (locations.indexOf(data.strike[j].location) == -1) {
      locations.push(data.strike[j].location);
    }
  }

  for (var k = 0; k < totalStrikes; k++) {
    if (isNaN(parseInt(data.strike[k].deaths_min, 10)) == false) {
      deathsMinTotal = deathsMinTotal + parseInt(data.strike[k].deaths_min, 10);
    }
    if (isNaN(parseInt(data.strike[k].deaths_max, 10)) == false) {
     deathsMaxTotal = deathsMaxTotal + parseInt(data.strike[k].deaths_max, 10);
    }
    if (isNaN(parseInt(data.strike[k].civilians, 10)) == false) {
     deathsCivilians = deathsCivilians + parseInt(data.strike[k].civilians, 10);
    }
    if (isNaN(parseInt(data.strike[k].children, 10)) == false) {
     deathsChildren = deathsChildren + parseInt(data.strike[k].children, 10);
    }
    if (isNaN(parseInt(data.strike[k].injuries, 10)) == false) {
     totalInjuries = totalInjuries + parseInt(data.strike[k].injuries, 10);
    }
  }

  var content = d3.select("#content").data(data.strike);
  content.append("p").text("Total Strikes: " + totalStrikes);
  content.append("p").text("Countries targeted: " + countries);
  content.append("p").text("Locations targeted: " + locations);
  content.append("p").text("Number Killed: " + deathsMinTotal + "–" + deathsMaxTotal);
  content.append("p").text("Civilians Killed: " + deathsCivilians);
  content.append("p").text("Children Killed: " + deathsChildren);
  content.append("p").text("Total Injured: " + totalInjuries);

var monthCount = {};

  data.strike.map(function(d, i) {
    var monthSet = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var thisYear = d.date.substr(0, 4);
    var thisMonth = d.date.substr(5, 2);
    var yearMonth = thisYear + "-" + thisMonth;

    if (monthCount[yearMonth]) {
      monthCount[yearMonth]["numStrikes"] += 1;
    }
    else {
      monthCount[yearMonth] = {};
      monthCount[yearMonth]["month"] = monthSet[parseInt(thisMonth)-1];
      monthCount[yearMonth]["year"] = parseInt(thisYear);
      monthCount[yearMonth]["numStrikes"] = 1;
    }
    // if dict has year-month
    //   then increment dict[year-month].numStrike by 1
    // else
    //   then add year-month to dict with numStrike = 1
  });



  console.log(data);
  console.log(monthCount);

  strikePerMonth(monthCount);


  var strikeDiv = content.selectAll("div").data(data.strike).enter().append("div").classed("strike", true).attr("id", function(d, i){return "trigger" + i;});
    strikeDiv.append("p").text(function(d, i) { var output = d.date.substr(0, 10) + " " + d.country + " " + d.deaths_max + " dead"; return output;});

  strikeDiv.on("mouseover", function(d) {
    var selectedStrike = svg.selectAll("rect").filter(function(thisd){return thisd==d;});
    selectedStrike.style("fill", function(d){return "#D62017"});
    selectedStrike.attr("width", 2);
    selectedStrike.attr("height", 1*d.deaths_max);
    selectedStrike.moveToFront();
    console.log([d.lon, d.lat]);
    // map.panTo([d.lon, d.lat]);
  });

  strikeDiv.on("mouseout", function(d) {
    var selectedStrike = svg.selectAll("rect").filter(function(thisd){return thisd==d;});
    selectedStrike.style("fill", function(d){return "#cccccc"});
    selectedStrike.transition().duration(500).attr("width", 2).attr("height", 2);
  });



  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  };


  var dots = svg.selectAll("rect.dot").data(data.strike);

  dots.enter()
    .append("rect")
    .attr("width", 1)
    .attr("height", 1)
    .style({
        fill: "#cccccc",
        "fill-opacity": 1,
        "stroke-width": 1
      })
    .transition().duration(1000)
    .attr("width", 2)
    .attr("height", 2)

  function render() {
    dots.attr({
      x: function(d) {
        var x = project(d).x;
        return x;
      },
      y: function(d) {
        var y = project(d).y;
        return y;
      },
      // r: function(d) {
      //   return map.getZoom();
      // }
    })
  }


  // re-render our visualization whenever the view changes
  map.on("viewreset", function() {
    render()
  })
  map.on("move", function() {
    render()
  })

  // render our initial visualization
  render()

  // $("html, body").animate({ scrollTop: $(document).height() }, 10000, "linear");
}

function strikePerMonth(data) {
  var minYear = 10000;
  var maxYear = 0;
  var startMonth = 12;
  var endMonth = 1;
  var maxCount = 0;

  for (var prop in data) {
    var thisYear = prop.substr(0, 4);
    if (thisYear < minYear) { minYear = thisYear; }
    if (thisYear > maxYear) { maxYear = thisYear; }
    if (data[prop]["numStrikes"] > maxCount) { maxCount = data[prop]["numStrikes"];}
  }

  for (var prop in data) {
    var thisYear = prop.substr(0, 4);
    var thisMonth = prop.substr(5, 2);

    if (thisYear == minYear){
      if (thisMonth < startMonth) { startMonth = thisMonth; }
    }
    if (thisYear == maxYear){
      if (thisMonth > endMonth) { endMonth = thisMonth; }
    }
  }

  console.log(minYear, maxYear, maxCount, startMonth, endMonth);

  var chart = d3.select("#chart").data(data);
  var margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = 600 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;


  var x = d3.time.scale()
      .domain([new Date(minYear, startMonth), new Date(maxYear, endMonth)])
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0])
      .domain([0, maxCount]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(10, d3.time.months);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Strikes");


  console.log("dataInD3", d3.entries(data)[1].value.numStrikes);
  console.log("dataLength", d3.entries(data).length);
  svg.selectAll(".bar")
      .data(d3.entries(data))
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(new Date(d.key.substr(0, 4), d.key.substr(5, 2))) })
      .attr("width", width/d3.entries(data).length)
      .attr("y", function(d) { return y(d.value.numStrikes) })
      .attr("height", function(d) { return height - y(d.value.numStrikes); });
}
