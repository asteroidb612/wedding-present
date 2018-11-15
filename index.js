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
  .attr("display", "inline-block")
  .attr("width", w)
  .attr("height", h);

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

d3.select("input[type=checkbox]").on("change", function() {
  cells.classed("voronoi", this.checked);
});

d3.csv("wedding.csv", function(guests) {
  guest_homes = [];
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

  var title = d3.select("h1");
  var currentScene = 0;
  // TODO: Brooke when present?
  // TODO: Tablet?
  // TODO: Recontextualize titles
  // From Brooke
  //// No response shaming
  //// Better SF frame, Bridge?
  //// Email Brooke invitations etc
  //// Nesting weird, how transition? https://bl.ocks.org/mbostock/1021841
  ////  TODO timeline https://bl.ocks.org/mbostock/6526445e2b44303eebf21da3b6627320
  function setScene() {
    console.log(currentScene);
    if (currentScene === 0) {
      title.text("Where do you live?");
      //  TODO: Get right lat,long",
      //  TODO: Change projection to rounder",
      //  TODO: center on sf",
      //  TODO: put non-latlong around round projection",
      //  TODO: fix voronoi spacing"
      //  TODO: Go backwards?
      //  TODO just states we have?
      //  TODO: Why can't we move backwards to this?
      //  TODO: trails over animations for lived, met, sf
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
        });
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
      title.text("Where are you now?"); //TODO ["real lat/longs", "new voronoi"]);
    } else if (currentScene === 2) {
      title.text("To San Francisco"); //TODO ["Party colors", "Zoom"]);
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
    } else if (currentScene === 3) {
      // TODO Show how long people have known mark or elaine
      // TODO COLOR
    } else if (currentScene === 4) {
      title.text("Does Cottonball Like you?");
      //TODO d3 to half, cotton ball slides in right
      //TODO vertical instead of horizontal
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

      d3
        .selectAll("#states path")
        .transition()
        .duration(1000)
        .attr("opacity", 1e-6); //Bostock recommendation, css can't use smaller interpolion resolution
      //TODO TODO SHIIIIT How do I get the simulated targets to transition to BEFORE transitioning?

      function positionForCottonBallY(d, i) {
        var ans = d["Does Cotton Ball like you?"];
        if (ans === "Yes") {
          return 400 + 100 * Math.random();
        } else if (ans === "No") {
          return 100 * Math.random();
        } else {
          return 200 + 100 * Math.random();
        }
      }
      function positionForCottonBallX() {
        return 300 + 100 * Math.random();
      }
      var forSim = circles
        .selectAll("circle")
        .transition()

        .duration(1750)
        .attr("cx", positionForCottonBallX)
        .attr("cy", positionForCottonBallY);

      //      setTimeout(function() {
      //        for (var i = 0; i < 100; i++) tick();
      //      }, 1750);

      var force = d3.layout
        .force()
        .nodes(guests)
        .size([w / 2, h])
        .gravity(0.22)
        .on("tick", tick)
        .start();

      function tick(e) {
        forSim
          .each(collide(0.5))
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          });
      }
      function collide(alpha) {
        var quadtree = d3.geom.quadtree(guests);
        return function(d) {
          var r = d.radius,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && quad.point !== d) {
              var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + quad.point.radius;
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      }
    } else if (currentScene === 5) {
      title.text("Keto");
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
      d3
        .selectAll("#states path")
        .transition()
        .duration(1000)
        .attr("opacity", 1e-6); //Bostock recommendation, css can't use smaller interpolion resolution

      function positionForKetoY(d, i) {
        var ans = d["Have you ever been on the Keto diet?"];
        if (ans === "Yes") {
          return 500 + 100 * Math.random();
        } else if (ans === "No") {
          return 100 + 100 * Math.random();
        } else {
          return 300 + 100 * Math.random();
        }
      }
      function positionForKetoX() {
        return 900 + 100 * Math.random();
      }
      circles
        .selectAll("circle")
        .transition()
        .duration(1750)
        .attr("cx", positionForKetoX)
        .attr("cy", positionForKetoY);
    } else if (currentScene === 6) {
      title.text("Tweets");
      // TODO Dots are fighting to talk?
      // TODO  Cycle over tweets
      // TODO Transition each tweeter to come to center to say
      // TODO Tweetbox for tweets
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
