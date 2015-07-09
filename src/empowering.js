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
        var icons = {
            0: '\uf0c0',
            1: '\uf007',
            2: '\uf0c0'
        };
        var width = 600;
        var height = 300;
        var y = d3.scale.linear()
                .range([height, 0])
                .domain([0, d3.max(cons)]);

        ot101.plot = d3.select(attrs.container)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

        var barWidth = width / cons.length;

        var bar = ot101.plot.selectAll('g')
            .data(cons)
            .enter().append('g')
            .attr('class', function(d, i) {return 'ot101 ' + styles[i]; })
            .attr('transform', function(d, i) {
                return 'translate(' + i * barWidth + ', 0)';
            });

        bar.append('text')
            .attr('class', 'icons')
            .attr('style', 'font: 40px FontAwesome; text-anchor: start')
            .attr('x', 0)
            .attr('y', height)
            .text(function(d, i) {return icons[i]; });

        bar.append('line')
                .attr('x1', 0)
                .attr('x2', '75')
                .attr('y1', height)
                .attr('y2', height);

        bar.append('path')
                .attr('d', function(d) {
                    return roundedRect(
                        75, y(d), 100, height - y(d), 10,
                        true, true, false, false);
                });

        bar.append('text')
                .attr('x', 125)
                .attr('y', function(d) { return y(d) + 15; })
                .attr('dy', '.75em')
                .text(function(d) { return d + ' kWh'; });

        ot101.infoTemplate = Handlebars.compile(
            'Has consumit un <span class="empowering ot101 info">' +
            '{{abs diffAverageConsumption}}% ' +
            '{{#positive diffAverageConsumption}}més{{else}}menys' +
            '{{/positive}}</span> ' +
            'que els teus veïns/es i un <span class="empowering ot101 info">' +
            '{{abs diffAverageEffConsumption}}% ' +
            '{{#positive diffAverageEffConsumption}}més{{else}}menys' +
            '{{/positive}}</span> que els teus veïns/es eficients'
        );

        if (attrs.info) {
            $('#' + attrs.info).html(ot101.infoTemplate(data));
        }

        ot101.customersTemplate = Handlebars.compile(
            'Els teus veïns/es són <strong>{{numberCustomers}}</strong> ' +
                'llars unifamiliars amb la mateixa potència contractada'
        );

        if (attrs.infoCustomers) {
            $('#' + attrs.infoCustomers).html(ot101.customersTemplate(data));
        }

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
        var width = 600 - margin.left - margin.right;
        var height = 250 - margin.top - margin.bottom;

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

    Empowering.Graphics.OT201 = function() {

        var ot201 = {};

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
    }
});
