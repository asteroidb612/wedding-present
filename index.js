var w = 1280,
  h = 800,
  colorInterval;

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
  .attr("display", "inline-block")
  .attr("width", w)
  .attr("height", h);

var bridge = svg
  .append("svg:image")
  .attr("id", "bridge")
  .attr("xlink:href", "bridge.jpg")
  .attr("height", h)
  .attr("width", w)
  .attr("opacity", 1e-6);
var states = svg.append("svg:g").attr("id", "states");

var circles = svg.append("svg:g").attr("id", "circles");

var cells = svg.append("svg:g").attr("id", "cells");

var cotton = svg
  .append("svg:image")
  .attr("id", "cotton")
  .attr("xlink:href", "cotton.jpg")
  .attr("height", h)
  .attr("width", w / 2)
  .attr("x", w)
  .attr("y", 0);

var keto = svg
  .append("svg:image")
  .attr("id", "keto")
  .attr("xlink:href", "roll.jpg")
  .attr("height", h)
  .attr("width", w / 2)
  .attr("x", -w)
  .attr("y", 0);

function sunflower(centerX, centerY, spacing, theta, skip) {
  //TODO More even spacing? https://bl.ocks.org/mbostock/11478058
  if (!spacing) spacing = 20;
  if (!theta) theta = 1;
  if (!skip) skip = 0;
  var offset = Math.random() * Math.PI * 2;
  var n = skip;
  return function(i) {
    var a = n * theta + offset;
    var radius = spacing * Math.sqrt(n);
    n += 1;
    return [centerX + radius * Math.cos(a), centerY + radius * Math.sin(a)];
  };
}

d3.select("input[type=checkbox]").on("change", function() {
  //TOO Fix voronoi overlays consistently
  cells.classed("voronoi", this.checked);
});

var guests;
d3.csv("wedding.csv", function(guest_data) {
  guest_homes = []; //TODO Replace by putting more x/y on the guest?
  guests = guest_data.filter(function(guest) {
    if (guest.longitude && guest.latitude) {
      guest_homes.push(projection([+guest.latitude, +guest.longitude]));
    } else {
      guest_homes.push([1000 + Math.random() * 150, 500]);
      guest.longitude = guest.latitude = 0;
    }
    if (guest) {
      return true;
    }
  });

  var title = d3.select("#title");
  var subtitle = d3.select("#text");
  var currentScene = 0;
  //// Better SF frame, Bridge?
  //// Email Brooke invitations etc
  ////  TODO timeline https://bl.ocks.org/mbostock/6526445e2b44303eebf21da3b6627320
  function setScene() {
    console.log(currentScene);
    if (currentScene === 0) {
      //  TODO: Get right lat,long",
      //  TODO: Change projection to rounder",
      //  TODO: center on sf",
      //  TODO: put non-latlong around round projection",
      //  TODO: fix voronoi spacing"
      //  TODO: clustering https://bl.ocks.org/mbostock/7882658
      d3.json("us-states.json", function(collection) {
        states
          .selectAll("path")
          .data(collection.features)
          .enter()
          .append("svg:path")
          .attr("d", path)
          .attr("opacity", 1);
      });

      //The voronoi polygons
      //      var polygons = d3.geom.voronoi(guest_homes);
      //      g
      //        .append("svg:path")
      //        .attr("class", "cell")
      //        .attr("d", function(d, i) {
      //          return "M" + polygons[i].join("L") + "Z";
      //        })
      //        .on("mouseover", function(d, i) {
      //          d3.select("h2 span").text(d["Where do you live?"]);
      //          d3.selectAll("circle").attr("r", function(c_d, c_i) {
      //            return i === c_i ? 20 : 10;
      //          });
      //        });

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
    } else if (currentScene === 1) {
    } else if (currentScene === 2) {
      var selection = circles.selectAll("circle");
      colorInterval = setInterval(function() {
        var index = Math.floor(Math.random() * guests.length);
        var colors = [
          [113, 146, 198],
          [59, 171, 97],
          [234, 207, 71],
          [204, 99, 51],
          [106, 70, 149],
          [166, 67, 82]
        ];
        var color = colors[Math.floor(colors.length * Math.random())];

        var fill = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
        d3.select(selection[0][index]).style("fill", fill);
      }, 5);
      for (var i = 0; i < guests.length; i++) {
        guests[i].bridgeX = 150 + Math.random() * (w - 250);
        guests[i].bridgeY = Math.random() * h / 3;
      }

      selection
        .transition()
        .duration((guestsToSF = 1750))
        .attr("cx", function(d, i) {
          return guest_homes[0][0];
        })
        .attr("cy", function(d, i) {
          return guest_homes[0][1];
        });

      d3
        .selectAll("#states path")
        .transition()
        .delay((statesOut = guestsToSF - 200))
        .duration(750)
        .attr("opacity", 1e-6);

      d3
        .select("#bridge")
        .transition()
        .delay((bridgeIn = statesOut + 400))
        .duration()
        .attr("opacity", 1);
      selection
        .transition()
        .delay(bridgeIn)
        .attr("cx", function(d) {
          return d.bridgeX;
        })
        .attr("cy", function(d) {
          return d.bridgeY;
        });
    } else if (currentScene === 3) {
      d3
        .select("#bridge")
        .transition()
        .duration(750)
        .attr("opacity", 1e-6)
        .each("end", function() {
          d3.select("#bridge").attr("x", "3000");
        });
      var met = [];
      for (var i = 0; i < guests.length; i++) {
        met.push(new Date(guests[i]["When did you meet?"]));
      }
      var x = d3.scale
        .linear()
        .range([200, w])
        .domain([_.min(met), _.max(met)]);

      var colorScale = d3.scale
        .linear()
        .range([
          [113, 146, 198],
          [59, 171, 97],
          [234, 207, 71],
          [204, 99, 51],
          [106, 70, 149],
          [166, 67, 82]
        ])
        .domain([_.min(met), _.max(met)]);
      svg
        .selectAll("circle")
        .transition()
        .attr("cx", function(d) {
          return x(new Date(d["When did you meet?"]));
        })
        .attr("cy", 400)
        .each("end", function() {
          clearInterval(colorInterval);
          svg.selectAll("circle").style("fill", function(d) {
            return colorScale(new Date(d["When did you meet?"]));
          });
        });

      // TODO Show how long people have known mark or elaine
      // TODO COLOR
    } else if (currentScene === 4) {
      //TODO Pictures shift depending on person. 3? more?
      // TODO force clustering https://bl.ocks.org/mbostock/7882658
      svg
        .select("#cotton")
        .transition()
        .duration(1750)
        .attr("height", h)
        .attr("width", w / 2)
        .attr("x", w / 2)
        .attr("y", 0);

      var sunYes = sunflower(300, 500),
        sunNo = sunflower(300, 300),
        sunWho = sunflower(300, 100);
      for (var i = 0; i < guests.length; i++) {
        var ans = guests[i]["Does Cotton Ball like you?"];
        var coords = //Man I wish JS had case expressions...
          ans === "Yes" ? sunYes() : ans === "No" ? sunNo() : sunWho();
        guests[i].cottonX = coords[0];
        guests[i].cottonY = coords[1];
      }
      circles
        .selectAll("circle")
        .transition()
        .duration(1750)
        .attr("cx", function(d) {
          return d.cottonX;
        })
        .attr("cy", function(d) {
          return d.cottonY;
        });
    } else if (currentScene === 5) {
      //TODO Slide in picture other side? Food from elaine?
      //TODO Kitchen pictures from mark!
      svg
        .select("#keto")
        .transition()
        .duration(1750)
        .attr("height", h)
        .attr("width", w / 2)
        .attr("x", 0)
        .attr("y", 0);
      svg
        .select("#cotton")
        .transition()
        .duration(1750)
        .attr("height", h)
        .attr("width", w / 2)
        .attr("x", w)
        .attr("y", 0);

      var ketoYes = sunflower(800, 500),
        ketoNo = sunflower(800, 300),
        ketoWho = sunflower(800, 100);

      for (var i = 0; i < guests.length; i++) {
        var ans = guests[i]["Have you ever been on the Keto diet?"];
        var coords = //Man I wish JS had case expressions...
          ans === "Yes" ? ketoYes() : ans === "No" ? ketoNo() : ketoWho();
        guests[i].ketoX = coords[0];
        guests[i].ketoY = coords[1];
      }

      circles
        .selectAll("circle")
        .transition()
        .duration(1750)
        .attr("cx", function(d) {
          return d.ketoX;
        })
        .attr("cy", function(d) {
          return d.ketoY;
        });
    } else if (currentScene === 6) {
      svg
        .select("#keto")
        .transition()
        .duration(1750)
        .attr("height", h)
        .attr("width", w / 2)
        .attr("x", -w)
        .attr("y", 0);
      var t = sunflower(w / 2, h / 2, null, null, 20);

      var tweet_coords = [];
      for (var i = 0; i < guests.length; i++) {
        var coords = t();
        tweet_coords.push(coords);
        guests[i].tweetX = coords[0];
        guests[i].tweetY = coords[1];
      }

      circles
        .selectAll("circle")
        .transition()
        .duration(1750)
        .attr("cx", function(d) {
          return d.tweetX;
        })
        .attr("cy", function(d) {
          return d.tweetY;
        });

      // TODO  Cycle over tweets
      // TODO Transition each tweeter to come to center to say
      // TODO Tweetbox for tweets
      //The voronoi polygons
      var g = cells
        .selectAll("g")
        .data(guests)
        .enter()
        .append("svg:g");
      var polygons = d3.geom.voronoi(tweet_coords);
      g
        .append("svg:path")
        .attr("class", "cell")
        .attr("d", function(d, i) {
          return "M" + polygons[i].join("L") + "Z";
        })
        .on("mouseover", function(d, i) {
          console.log(
            d[
              "Please write a tweet for Mark and Elaine (no more than 140 characters, okay?)Where do you live?"
            ]
          );
          subtitle.text(
            d[
              "Please write a tweet for Mark and Elaine (no more than 140 characters, okay?)"
            ]
          );
          d3.selectAll("circle").attr("r", function(c_d, c_i) {
            return i === c_i ? 15 : 10;
          });
        });
    }
  }
  document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowRight") {
      currentScene += 1;
      setScene();
    }
  });
  setScene();
});
