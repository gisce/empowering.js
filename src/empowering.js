/* global Handlebars */
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
        adapter: 'jQPlot'
    };

    Empowering.Graphics.OT101 = function(attrs) {

        /*
        {
              "contractId": "123457ABC",
              "companyId": 1234567890,
              "month": 201307,
              "setup": 52234e386cb9fea66d5b2511,
              "consumption": 1,
              "averageEffConsumption": 1,
              "averageConsumption": 1,
              "diffAverageEffConsumption": -33,
              "diffAverageConsumption": -61,
              "numberCustomersEff": 1,
              "numberCustomers": 1
         }
         */

        var ot101 = {};

        var data = JSON.parse(attrs.data);

        ot101.plot = $.jqplot(attrs.container, [
            [data.averageConsumption],
            [data.consumption],
            [data.averageEffConsumption]],
            {
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer,
                rendererOptions: {fillToZero: true},
                pointLabels: {show: true, formatString: '%s kWh'}
            },
            series: [
                {label: 'Els teus veins'},
                {label: 'Tu'},
                {label: 'Els teus veins eficients'}
            ],
            legend: {
                show: true,
                location: 'ne'
            },
            axes: {
                xaxis: {
                    show: false,
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: [data.month]
                },
                yaxis: {
                    showTicks: false
                }
            },
            grid: {
                drawGridlines: false,
                background: '#fff'
            }

        });

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

        var data = JSON.parse(attrs.data);

        var averageEffConsumption = [];
        var consumption = [];
        var averageConsumption = [];

        data.forEach(function(x) {
            averageEffConsumption.push(x.averageEffConsumption);
            consumption.push(x.consumption);
            averageConsumption.push(x.averageConsumption);
        });

        ot103.plot = $.jqplot(attrs.container, [
            averageConsumption, consumption, averageEffConsumption
        ], {
            axes: {
                yaxis: {
                    pad: 1.2,
                    tickOptions: {
                        formatString: '%d kWh'
                    }
                }
            },
            series: [
                {label: 'Els teus veins'},
                {label: 'Tu'},
                {label: 'Els teus veins eficients'}
            ],
            legend: {
                show: true,
                location: 'ne'
            }
        });

        return ot103;
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
