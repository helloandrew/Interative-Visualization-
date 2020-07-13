// Create an SVG wrapper
var svgHeight = 600;
var svgWidth = 900;

var margins = {
    top: 30,
    bottom:60,
    left:90,
    right: 30
};

var width = svgWidth - margins.left - margins.right;
var height = svgHeight - margins.top - margins.bottom;

// Append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);
var chartGroup = svg.append("g").attr("transform", `translate(${margins.left},${margins.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating xAxis and yAxis var upon click on axis labels
function renderAxes_x(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
   
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
};

function renderAxes_y(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;
};


// function used for updating circles group with a transition to new circles, depending on which axis 
function renderCircles_x(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    // .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

// Event listener 
function updateToolTips(chosenXAxis, chosenYAxis, circlesGroup){
    // choose from labels shown on x-axis 
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty";
    }
    if (chosenXAxis === "age") {
        var xLabel = "Age (Median)";
    }
    else if (chosenXAxis === "income") {
        var xLabel = "Household Income (Median)";
    };

    // choose from labels shown on y-axis
    if (chosenYAxis === "obesity") {
        var yLabel = "Obesse (%)";
    }
    if (chosenYAxis === "smokes") {
        var yLabel = "Smokes (%)";
    }
    else if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare (%)"
    };

    var toolTip = d3.tip()
        .attr("class", "toolTip")
        .offset([80, -60])
        .html(function(allData) {
            return (`${allData[chosenYAxis]}<br>${xLabel}<br>${yLabel}<br>${allData[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    .on("mouseout", function(data){
        toolTip.hide(data);
    });

    return circlesGroup;
};


function renderCircles_y(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};


d3.csv('data.csv').then(function(allData){
    console.log(allData);
    var title = allData.columns;
    console.log(title);

    //  cast as numbers
    allData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    // create axis functions
    // function used for updating x-scale var upon click on axis label
    function xScale(allData, chosenXAxis){
        var linearScale_x_chosen = d3.scaleLinear()
            .domain([d3.min(allData, d => d[chosenXAxis]) * 0.8, d3.max(allData, d => d[chosenXAxis]) * 1.2])
            .range([0, width]);
        
        return linearScale_x_chosen;
    };

    var xLinearScale = xScale(allData, chosenXAxis);

    // function used for updating y-scale var upon click on axis label
    function yScale(allData, chosenYAxis){
        var linearScale_y_chosen = d3.scaleLinear()
            .domain([d3.min(allData, d => d[chosenYAxis]) * 0.8, d3.max(allData, d => d[chosenYAxis]) * 1.2])
            .range([height - 40, 0]);
        
        return linearScale_y_chosen;
    };

    var yLinearScale = yScale(allData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    var xAxis = chartGroup.append("g").attr("transform", `translate(0, ${height - 40})`).call(bottomAxis);
    var yAxis = chartGroup.append("g").call(leftAxis);

    // create circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(allData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".4");

    // create groups for labels 
    var labelsGroup_x = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height - 20})`);

    // x-axis labels
    var povertyLabel = labelsGroup_x.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup_x.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup_x.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");
   
    // y-axis labels
    var labelsGroup_y = chartGroup.append("g")
        .attr("dy", "1em");

    var obesityLabel = labelsGroup_y.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -70)
        .attr("x", 0 - (height/2))
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obesity (%)");

    var smokesLabel = labelsGroup_y.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", 0 - (height/2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smoke (%)");

    var healthcareLabel = labelsGroup_y.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", 0 - (height/2))
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    var circlesGroup = updateToolTips(chosenXAxis, chosenYAxis, circlesGroup)

    labelsGroup_x.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(allData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes_x(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles_x(circlesGroup, xLinearScale, chosenXAxis); 

                if (chosenXAxis === "poverty") {
                    povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);

                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);

                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }

                if (chosenXAxis === "age") {
                    ageLabel
                    .classed("active", true)
                    .classed("inactive", false);

                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);

                    incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }

                else if (chosenXAxis === "income") {
                    incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);

                    ageLabel
                    .classed("active", false)
                    .classed("inactive", true);

                    povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        });

    labelsGroup_y.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;

                // updates y scale for new data
                yLinearScale = xScale(allData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderAxes_y(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles_y(circlesGroup, yLinearScale, chosenYAxis); 

                if (chosenYAxis === "obesity") {
                    obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                    
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);

                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }

                if (chosenYAxis === "smokes") {
                    smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);

                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);

                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }

                else if (chosenYAxis === "healthcare") {
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);

                    smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);

                    obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                }
            }
        });

});




// labelsGroup.selectAll("text")
// .on("click", function(){
//     var value = d3.select(this).attr("value");
//     if (value !== chosenYAxis){
//         chosenYAxis = value;
//         xLinearScale = xScale(allData, chosenXAxis);
//         // xAxis = renderAxes(xLinearScale, xAxis);
//         // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

//     }
// })

// return circlesGroup;