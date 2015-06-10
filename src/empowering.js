var Empowering = {};

(function(){
    'use strict';

    Empowering.Service = function(spec) {
        var service = {};

        service.foo = function() {
            return spec.name
        };

        return service;
    };

    Empowering.Graphics = {
        adapter: "jQPlot"
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

        var info_view = {
            data: data,
            avgConsum: function() {
                return function (text, render) {

                }
            }
        };

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
                {label: "Els teus veins"},
                {label: "Tu"},
                {label: "Els teus veins eficients"}
            ],
            legend: {
                show: true,
            },
            axes: {
                xaxis: {
                    show: false,
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ["201307"]
                },
                yaxis: {
                    showTicks: false
                }
            },
            grid: {
                drawGridlines: false,
                background: "#fff"
            }

        });

        ot101.info_template = Mustache.render("Has consumit un {{diffAverageConsumption}} ")

        return ot101;
    };

}());