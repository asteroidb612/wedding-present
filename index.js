var w = 1280,
  h = 800;

var projection = d3.geo
  .azimuthal()
  .mode("equidistant")
  .origin([-98, 38])
  .scale(1400)
  .translate([640, 360]);

var path = d3.geo.path().projection(projection);

var svg = d3
  .select("body")
  .insert("svg:svg", "h2")
  .attr("width", w)
  .attr("height", h);

var states = svg.append("svg:g").attr("id", "states");

var circles = svg.append("svg:g").attr("id", "circles");

var cells = svg.append("svg:g").attr("id", "cells");

d3.select("input[type=checkbox]").on("change", function() {
  cells.classed("voronoi", this.checked);
});

d3.json("us-states.json", function(collection) {
  states
    .selectAll("path")
    .data(collection.features)
    .enter()
    .append("svg:path")
    .attr("d", path)
    .attr("opacity", 1);
});

d3.csv("flights-airport.csv", function(flights) {
  var linksByOrigin = {},
    countByAirport = {},
    locationByAirport = {},
    positions = [];

  var arc = d3.geo
    .greatArc()
    .source(function(d) {
      return locationByAirport[d.source];
    })
    .target(function(d) {
      return locationByAirport[d.target];
    });

  flights.forEach(function(flight) {
    var origin = flight.origin,
      destination = flight.destination,
      links = linksByOrigin[origin] || (linksByOrigin[origin] = []);
    links.push({ source: origin, target: destination });
    countByAirport[origin] = (countByAirport[origin] || 0) + 1;
    countByAirport[destination] = (countByAirport[destination] || 0) + 1;
  });

  d3.csv("airports.csv", function(airports) {
    // Only consider airports with at least one flight.
    airports = airports.filter(function(airport) {
      if (countByAirport[airport.iata]) {
        var location = [+airport.longitude, +airport.latitude];
        locationByAirport[airport.iata] = location;
        positions.push(projection(location));
        return true;
      }
    });

    // Compute the Voronoi diagram of airports' projected positions.

    //    circles.selectAll("circle")
    //        .data(airports)
    //      .enter().append("svg:circle")
    //        .attr("cx", function(d, i) { return positions[i][0]; })
    //        .attr("cy", function(d, i) { return positions[i][1]; })
    //        .attr("r", function(d, i) { return Math.sqrt(countByAirport[d.iata]); })
    //        .sort(function(a, b) { return countByAirport[b.iata] - countByAirport[a.iata]; });

    guest_homes = [];
    d3.csv("wedding.csv", function(guests) {
      guests = guests.filter(function(guest) {
        if (guest.longitude && guest.latitude) {
          guest_homes.push(projection([+guest.latitude, +guest.longitude]));
        } else {
          guest_homes.push([1000 + Math.random() * 150, Math.random() * 500]);
          guest.longitude = guest.latitude = 0;
        }
        if (guest) {
          return true;
        }
      });

      var g = cells
        .selectAll("g")
        .data(guests)
        .enter()
        .append("svg:g");

      //The voronoi polygons
      var polygons = d3.geom.voronoi(guest_homes);
      g
        .append("svg:path")
        .attr("class", "cell")
        .attr("d", function(d, i) {
          return "M" + polygons[i].join("L") + "Z";
        })
        .on("mouseover", function(d, i) {
          d3.select("h2 span").text(d["Where do you live?"]);
          d3.selectAll("circle").attr("r", function(c_d, c_i) {
            return i === c_i ? 20 : 10;
          });
        });

      circles
        .selectAll("circle")
        .data(guests)
        .enter()
        .append("svg:circle")
        .attr("cx", function(d, i) {
          return guest_homes[i][0];
        })
        .attr("cy", function(d, i) {
          return guest_homes[i][1];
        })
        .attr("r", function() {
          return 10;
        });

      document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowRight") {
          d3
            .selectAll("#states path")
            .transition()
            .duration(1750)
            .attr("opacity", 1e-6); //Bostock recommendation, css can't use smaller interpolion resolution
          circles
            .selectAll("circle")
            .transition()
            .duration(1750)
            .attr("cx", function(d, i) {
              return guest_homes[0][0];
            })
            .attr("cy", function(d, i) {
              return guest_homes[0][1];
            });
        }
        if (event.key === "ArrowLeft") {
          d3
            .selectAll("#states path")
            .transition()
            .duration(1000)
            .attr("opacity", 1e-6); //Bostock recommendation, css can't use smaller interpolion resolution

          function positionForCottonBallX(d, i) {
            var ans = d["Does Cotton Ball like you?"];
            if (ans === "Yes") {
              return 700 + 100 * Math.random();
            } else if (ans === "No") {
              return 300 + 100 * Math.random();
            } else {
              return 500 + 100 * Math.random();
            }
          }
          function positionForCottonBallY() {
            return 300 + 100 * Math.random();
          }
          circles
            .selectAll("circle")
            .transition()
            .duration(1750)
            .attr("cx", positionForCottonBallX)
            .attr("cy", positionForCottonBallY);
        }
      });
    });
  });
});
