/* global Handlebars, d3, Backform, Backbone */
var Empowering = {};

(function() {
    'use strict';

    Empowering.Service = function(spec) {
        var service = {};

        service.foo = function() {
            return spec.name;
        };

        return service;
    };

    Empowering.Graphics = {

    };

    function roundedRect(x, y, w, h, r, tl, tr, bl, br) {
        var retval;
        retval  = 'M' + (x + r) + ',' + y;
        retval += 'h' + (w - 2 * r);
        if (tr) {
            retval += 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + r;
        }
        else {
            retval += 'h' + r;
            retval += 'v' + r;
        }
        retval += 'v' + (h - 2 * r);
        if (br) {
            retval += 'a' + r + ',' + r + ' 0 0 1 ' + -r + ',' + r;
        }
        else {
            retval += 'v' + r;
            retval += 'h' + -r;
        }
        retval += 'h' + (2 * r - w);
        if (bl) {
            retval += 'a' + r + ',' + r + ' 0 0 1 ' + -r + ',' + -r;
        }
        else {
            retval += 'h' + -r;
            retval += 'v' + -r;
        }
        retval += 'v' + (2 * r - h);
        if (tl) {
            retval += 'a' + r + ',' + r + ' 0 0 1 ' + r + ',' + -r;
        }
        else {
            retval += 'v' + -r;
            retval += 'h' + r;
        }
        retval += 'z';
        return retval;
    }

    Empowering.Graphics.OT101 = function(attrs) {

        /*
        {
              'contractId': '123457ABC',
              'companyId': 1234567890,
              'month': 201307,
              'setup': 52234e386cb9fea66d5b2511,
              'consumption': 1,
              'averageEffConsumption': 1,
              'averageConsumption': 1,
              'diffAverageEffConsumption': -33,
              'diffAverageConsumption': -61,
              'numberCustomersEff': 1,
              'numberCustomers': 1
         }
         */

        var ot101 = {};
        if (typeof attrs.data === 'string') {
            attrs.data = JSON.parse(attrs.data);
        }
        var data = attrs.data;
        var cons = [
            parseInt(data.averageConsumption),
            parseInt(data.consumption),
            parseInt(data.averageEffConsumption)
        ];
        var styles = {
          0: 'averageConsumption',
          1: 'consumption',
          2: 'averageEffConsumption'
        };
        var labels = attrs.labels || {
            0: 'Your neighbors',
            1: 'You',
            2: 'Your efficient neighbors'
        };
        var icons = {
            0: '\uf0c0',
            1: '\uf007',
            2: '\uf0c0'
        };
        var width = attrs.width || 600;
        var height = attrs.height || 300;

        ot101.plot = d3.select(attrs.container)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

        var barWidth = width / cons.length;
        var labelSize = 10;
        var barHeight = height - labelSize - 10;
        var rectWidth = barWidth * 0.375;
        var barEnerWidth = barWidth * 0.5;

        var y = d3.scale.linear()
                .range([barHeight, 0])
                .domain([0, d3.max(cons)]);

        var bar = ot101.plot.selectAll('g')
            .data(cons)
            .enter().append('g')
            .attr('class', function(d, i) {return 'ot101 ' + styles[i]; })
            .attr('transform', function(d, i) {
                return 'translate(' + i * barWidth + ', 0)';
            });

        bar.append('text')
            .attr('class', 'icons')
            .attr('style', 'font: ' + parseInt(width / 12) + 'px FontAwesome;' +
                            'text-anchor: start')
            .attr('x', 0)
            .attr('y', barHeight)
            .text(function(d, i) {return icons[i]; });

        bar.append('line')
                .attr('x1', width * 0.025)
                .attr('x2', rectWidth + barEnerWidth)
                .attr('y1', barHeight)
                .attr('y2', barHeight);

        bar.append('path')
                .attr('d', function(d) {
                    return roundedRect(
                        rectWidth, y(d), barEnerWidth, barHeight - y(d), 10,
                        true, true, false, false);
                });

        bar.append('text')
                .attr('x', width * 0.21)
                .attr('y', function(d) { return y(d) + 15; })
                .attr('dy', '.' + width * 0.125 + 'em')
            .attr('class', 'value')
                .attr('style', 'font-size: ' + width * 0.033 + 'px')
                .text(function(d) { return d + ' kWh'; });

        bar.append('text')
            .attr('x', 0)
            .attr('y', height - 2)
            .attr('class', 'label')
            .attr('style', 'font-size: ' + labelSize + 'px')
            .text(function(d, i) { return labels[i]; });

        return ot101;
    };

    Empowering.Graphics.OT103 = function(attrs) {
        var ot103 = {};

        if (typeof attrs.data === 'string') {
            attrs.data = JSON.parse(attrs.data);
        }
        var data = attrs.data;

        var parseDate = d3.time.format('%Y%m').parse;

        var margin = {top: 20, right: 20, bottom: 30, left: 50};
        var width = (attrs.width || 600) - margin.left - margin.right;
        var height = (attrs.height || 300) - margin.top - margin.bottom;

        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis().scale(x).orient('bottom')
            .tickFormat(d3.time.format('%m/%Y'));
        var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5);

        var line = d3.svg.line()
            .x(function(d) { return x(d.month); })
            .y(function(d) { return y(d.consumption); });

        var lineAvgEff = d3.svg.line()
            .x(function(d) { return x(d.month); })
            .y(function(d) { return y(d.averageEffConsumption); });

        var lineAvg = d3.svg.line()
            .x(function(d) { return x(d.month); })
            .y(function(d) { return y(d.averageConsumption); });

        ot103.plot = d3.select(attrs.container)
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);

        var bar = ot103.plot
                .append('g')
                .attr('transform',
                      'translate(' + margin.left + ',' + margin.top + ')')
                .attr('class', 'ot103');

        var allCons = [];
        var consumption = [];
        var averageConsumption = [];
        var averageEffConsumption = [];

        data.forEach(function(d) {
            d.month = parseDate(d.month + '');
            if (d.consumption !== null) {
                consumption.push(d);
            }
            if (d.averageConsumption !== null) {
                averageConsumption.push(d);
            }
            if (d.averageEffConsumption !== null) {
                averageEffConsumption.push(d);
            }
            allCons.push(
                d.consumption, d.averageEffConsumption, d.averageConsumption
            );
        });

        x.domain(d3.extent(data, function(d) { return d.month; }));
        y.domain(d3.extent(allCons));

        bar.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        bar.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('dy', '.71em')
              .style('text-anchor', 'end')
              .text('kWh');

        var labels = attrs.labels || {
            0: 'Your neighbors',
            1: 'You',
            2: 'Your efficient neighbors'
        };

        var styles = {
          0: 'averageConsumption',
          1: 'consumption',
          2: 'averageEffConsumption'
        };

        [0, 1, 2].forEach(function(idx) {
            bar.append('g')
                .attr('class', 'legend')
                .append('text')
                .attr('x', 100 * idx)
                .attr('y', height + margin.bottom)
                .attr('class', styles[idx])
                .text(labels[idx]);
        });

        bar.selectAll('.ot103')
            .data(data).enter()
            .append('line')
            .attr('class', 'x vertical')
            .attr('x1', function(d) { return x(d.month); })
            .attr('x2', function(d) { return x(d.month); })
            .attr('y1', 0)
            .attr('y2', height);

        /*.attr('class', 'point consumption')
            .attr('cx', function(d) { return x(d.month); })
            .attr('cy', function(d) { return y(d.consumption); })
            .attr('r', 7);*/

        bar.append('path')
            .datum(averageEffConsumption)
            .attr('class', 'line averageEffConsumption')
            .attr('d', lineAvgEff);

        bar.selectAll('.ot103')
            .data(averageEffConsumption).enter()
            .append('circle')
            .attr('class', 'point averageEffConsumption')
            .attr('cx', function(d) { return x(d.month); })
            .attr('cy', function(d) { return y(d.averageEffConsumption); })
            .attr('r', 4);

        bar.append('path')
            .datum(averageConsumption)
            .attr('class', 'line averageConsumption')
            .attr('d', lineAvg);

        bar.selectAll('.ot103')
            .data(averageConsumption).enter()
            .append('circle')
            .attr('class', 'point averageConsumption')
            .attr('cx', function(d) { return x(d.month); })
            .attr('cy', function(d) { return y(d.averageConsumption); })
            .attr('r', 4);

        bar.append('path')
            .datum(consumption)
            .attr('class', 'line consumption')
            .attr('d', line);

        bar.selectAll('.ot103')
            .data(consumption).enter()
            .append('circle')
            .attr('class', 'point consumption')
            .attr('cx', function(d) { return x(d.month); })
            .attr('cy', function(d) { return y(d.consumption); })
            .attr('r', 4);

        return ot103;
    };

    Empowering.Graphics.OT201 = function(attrs) {

        /*
        {
            "contractId": "1234567ABC",
            "companyId": 1234567890,
            "month": 201307,
            "setup": "52234e386cb9fea66d5b2511",
            "actualConsumption": 1,
            "previousConsumption": 1,
            "diffConsumption": 1
        }
         */

        var ot201 = {};

        if (typeof attrs.data === 'string') {
            attrs.data = JSON.parse(attrs.data);
        }
        var data = attrs.data;

        var cons = [
            parseInt(data.previousConsumption),
            parseInt(data.actualConsumption)
        ];
        var styles = {
          0: 'previousConsumption',
          1: 'consumption'
        };
        var labels = attrs.labels || {
            0: 'Last year consumption',
            1: 'Actual consumption'
        };
        var icons = {
            0: '\uf007',
            1: '\uf007'
        };

        var width = attrs.width || 600;
        var height = attrs.height || 300;

        ot201.plot = d3.select(attrs.container)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

        var barWidth = width / cons.length;
        var labelSize = 10;
        var barHeight = height - labelSize - 10;
        var rectWidth = barWidth * 0.375;
        var barEnerWidth = barWidth * 0.5;

        var y = d3.scale.linear()
                .range([barHeight, 0])
                .domain([0, d3.max(cons)]);

        var bar = ot201.plot.selectAll('g')
            .data(cons)
            .enter().append('g')
            .attr('class', function(d, i) {return 'ot201 ' + styles[i]; })
            .attr('transform', function(d, i) {
                return 'translate(' + i * barWidth + ', 0)';
            });

        bar.append('text')
            .attr('class', 'icons')
            .attr('style', 'font: ' + parseInt(width / 12) + 'px FontAwesome;' +
                            'text-anchor: start')
            .attr('x', 0)
            .attr('y', barHeight)
            .text(function(d, i) {return icons[i]; });

        bar.append('line')
                .attr('x1', width * 0.025)
                .attr('x2', rectWidth + barEnerWidth)
                .attr('y1', barHeight)
                .attr('y2', barHeight);

        bar.append('path')
            .attr('d', function(d) {
                return roundedRect(
                    rectWidth, y(d), barEnerWidth, barHeight - y(d), 10,
                    true, true, false, false);
            });

        bar.append('text')
            .attr('x', (rectWidth + 10) * 1.5)
            .attr('y', function(d) { return y(d) + 25; })
            .attr('class', 'value')
            .attr('style', 'font-size: ' + width * 0.033 + 'px')
            .text(function(d) { return d + ' kWh'; });

        bar.append('text')
            .attr('x', 0)
            .attr('y', height - 2)
            .attr('class', 'label')
            .attr('style', 'font-size: ' + labelSize + 'px')
            .text(function(d, i) { return labels[i]; });

        return ot201;

    };

    Empowering.Forms = {};

    Empowering.Forms.BuildingData = function(attrs) {

        var buildingDataModel = new Backbone.Model({});

        var buildingData = new Backform.Form({
            el: attrs.container,
            model: buildingDataModel,
            fields: [
                {
                    name: 'buildingConstructionYear',
                    label: 'Construction Year',
                    control: 'input',
                    type: 'number'
                },
                {
                    name: 'dwellingArea',
                    label: 'Dwelling Area',
                    control: 'input'
                },
                {
                    name: 'buildingType',
                    label: 'Building Type',
                    control: 'select',
                    options: [
                        {label: 'Single house', value: 'Single_house'},
                        {label: 'Apartment', value: 'Apartment'}
                    ]

                },
                {
                    name: 'dwellingPositionInBuilding',
                    label: 'Dwelling Position in Building',
                    control: 'select',
                    options: [
                        {label: 'First Floor', value: 'first_floor'},
                        {label: 'Middle Floor', value: 'middle_floor'},
                        {label: 'Last Floor', value: 'last_floor'},
                        {label: 'Other', value: 'other'}
                    ]
                },
                {
                    name: 'dwellingOrientation',
                    label: 'Dwelling Orientation',
                    control: 'select',
                    options: [
                        {label: 'South', value: 'S'},
                        {label: 'Southeast', value: 'SE'},
                        {label: 'East', value: 'E'}
                    ]
                }
            ]
        });
        return buildingData;
    };
}());

Handlebars.registerHelper({
    positive: function(value, options) {
        'use strict';
        if (value >= 0) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    },
    abs: function(value) {
        'use strict';
        return Math.abs(value);
    },
    absInt: function(value) {
        'use strict';
        return Math.abs(parseInt(value));
    }
});
