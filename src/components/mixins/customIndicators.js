
import { makeApiRequest } from './apiConnectionPool.js';
import { myntDCUrl, mynturl, params, myntappurl } from "../../apiurl";
var dayWiseDataMap = {};
var dayWiseRangeMap = {};
var prev = 0;

export var common = {
  setNameAndRequiredField: function (name, indicatorTemplate) {
    var metaInfo = indicatorTemplate.metainfo
    metaInfo['id'] = name + '@tv-basicstudies-1',
      (metaInfo)._metainfoVersion = 52,
      metaInfo.name = name,
      metaInfo['description'] = name,
      metaInfo['shortDescription'] = name,
      metaInfo['is_hidden_study'] = false,
      metaInfo.isCustomIndicator = true,
      indicatorTemplate.metainfo = metaInfo;
    indicatorTemplate.constructor.prototype.constructor = indicatorTemplate.constructor
    return indicatorTemplate
  },
  getDefaultStyle: function (plots) {
    let styleMap = { linestyle: 0, visible: true, linewidth: 2, plottype: 0, trackPrice: false }, defaultStyle = {};
    for (var key in plots) styleMap.color = plots[key], defaultStyle[key] = JSON.parse(JSON.stringify(styleMap));
    return defaultStyle;
  }, getStyle: function (plots) {
    let styleMap = { histogramBase: 0 }, style = {};
    for (var key in plots) styleMap.title = key, style[key] = JSON.parse(JSON.stringify(styleMap));
    return style;
  }, getPlots: function (plots) {
    let plotArray = [];
    for (var plotId in plots) {
      let plotObject = { id: "", type: "line" };
      plotObject.id = plotId, plotArray.push(JSON.parse(JSON.stringify(plotObject)));
    }
    return plotArray;
  },
  getDateObject: function (_0x3e644a) {
    const dateArray = new Date(_0x3e644a).toString()["split"](" ");
    var timeArray = dateArray[4]["toString"]().split(":"), month;
    let dateObject = {};
    return dateObject["Year"] = parseInt(dateArray[3]), dateObject["Month"] = (month = dateArray[1], ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month) + 1), dateObject["Day"] = parseInt(dateArray[2]), dateObject["Hour"] = parseInt(timeArray[0]), dateObject["Minute"] = parseInt(timeArray[1]), dateObject;
  }, getUnixTimeStamp: function (time) {
    return time = time.Month + "/" + time.Day + "/" + time.Year + " " + time.Hour + ":" + time.Minute + ":00", Date.parse(time);
  }
},
  customIndicator = function () {
    let symbolBars = {};
    let weeklySymbolBars = {};
    function dateMonthYear(date) {
      var dateArray
      return dateArray = new Date(date).toString().split(" "), dateArray[2] + "_" + dateArray[1] + "_" + dateArray[0] + "_" + dateArray[3];
    }
    function weekMonthYear(utcSeconds) {
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      var dateArray;
      d.setUTCMilliseconds(utcSeconds);
      var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
      return dateArray = new Date(d.setDate(diff)).toString().split(" "), dateArray[2] + "_" + dateArray[1] + "_" + dateArray[0] + "_" + dateArray[3];
    }
    return {
      getIndicatorTemplates: function (PineJS) {
        let templates = [];
        templates.push(cpr['getIndicatorTemplates'](PineJS)),
          templates.push(ohCL["getIndicatorTemplates"](PineJS)),
          templates.push(boring["getIndicatorTemplates"](PineJS)),
          templates.push(range_breakout["getIndicatorTemplates"](PineJS)),
          templates.push(high_low_yesterday["getIndicatorTemplates"](PineJS)),
          templates.push(macd_c4["getIndicatorTemplates"](PineJS))
        templates.push(anchor["getIndicatorTemplates"](PineJS))
        return Promise.resolve(templates);
      },
      getIndicatorValues: function (symbolInfo) {
        return new Promise((resolve) => {
          var curTime;
          // eslint-disable-next-line no-prototype-builtins
          symbolBars['hasOwnProperty'](symbolInfo['ticker']) && weeklySymbolBars['hasOwnProperty'](symbolInfo['ticker']) ? resolve() : (symbolBars[symbolInfo['ticker']] = null,
            weeklySymbolBars[symbolInfo['ticker']] = null,
            curTime = Math.round((new Date).getTime() / 1000),

            getHistoryData(symbolInfo, "1D", { from: curTime - 15552000, to: curTime }).then(response => {
              symbolBars[symbolInfo["ticker"]] = function (bars) {
                let timeWiseBars = {};
                try {
                  for (let i = 0; i < bars.length; i++) {
                    var barTime = dateMonthYear(bars[i].time), barOpen = bars[i].open, barHigh = bars[i].high, barLow = bars[i].low, barClose = bars[i].close;
                    let previousDate;
                    previousDate = 0 === i ? NaN : dateMonthYear(bars[i - 1].time), timeWiseBars[barTime] = { open: barOpen, high: barHigh, low: barLow, previousDate: previousDate, close: barClose };
                  }
                } catch (error) {
                  console.log("Error in convertBarsToObject : ", error);
                }
                return timeWiseBars;
              }(response['bars']);
              return getHistoryData(symbolInfo, "1W", { from: curTime - 15552000, to: curTime })
            }).then((response) => {
              resolve(), weeklySymbolBars[symbolInfo["ticker"]] = function (bars) {
                let timeWiseBars = {};
                try {
                  for (let i = 0; i < bars.length; i++) {
                    var barTime = weekMonthYear(bars[i].time), barOpen = bars[i].open, barHigh = bars[i].high, barLow = bars[i].low, barClose = bars[i].close;
                    let previousDate, previousDateUTC;
                    previousDate = 0 === i ? NaN : weekMonthYear(bars[i - 1].time), previousDateUTC = 0 === i ? NaN : bars[i - 1].time, timeWiseBars[barTime] = { open: barOpen, high: barHigh, low: barLow, previousDate: previousDate, previousDateUTC: previousDateUTC, close: barClose };
                  }
                } catch (error) {
                  console.log("Error in convertBarsToObject : ", error);
                }
                return timeWiseBars;
              }(response['bars']);
            })["catch"](function (error) {
              console.log("getIndicatorValues : failed to load all bars", error), resolve();
            }));
        });
      }, getMapping: function () {
        return symbolBars;
      }, getWeeklyMapping: function () {
        return weeklySymbolBars
      }, getDateMonthYear: dateMonthYear,
      getWeekMonthYear: weekMonthYear,
    };
  }(),
  boring = {
    getIndicatorTemplates: function (PineJS) {
      return common.setNameAndRequiredField("open Interest", {
        metainfo: {
          _metainfoVersion: 51,
          id: 'Open Interest',
          description: 'Open Interest',
          shortDescription: 'Open Interest',
          is_hidden_study: false,
          is_price_study: false,
          isCustomIndicator: true,
          format: {
            type: 'price',
            precision: 1,
          },
          plots: [
            {
              id: 'plot_0',
              type: 'line',
            },
            {
              id: 'OI_MA',
              type: 'line',
            }
          ],
          defaults: {
            styles: {
              'plot_0': {
                linestyle: 0,
                visible: true,
                linewidth: 1,
                plottype: 0,
                trackPrice: false,
                color: 'blue'
              },
              'OI_MA': {
                linestyle: 0,
                visible: true,
                linewidth: 1,
                plottype: 0,
                trackPrice: false,
                color: 'black'
              }
            },
            precision: 1,
            inputs: {
              length: 20,
              ma: 'SMA'
            }
          },
          styles: {
            'plot_0': {
              title: 'OI Line',
              histogramBase: 0,
            },
            'OI_MA': {
              title: 'OI MA',
              histogramBase: 0,
            }
          },
          'inputs': [
            {
              id: "length",
              name: "MA Length",
              type: "integer",
              isHidden: false,
              defval: 20,
              min: 1,
              max: 200,
            },
            {
              id: "ma", name: "MA Type", type: "text", defval: 'SMA', options: ['SMA', 'EMA'], optionsTitles: {
                'SMA': 'SMA',
                'EMA': 'EMA'
              }
            }
          ],
        },
        constructor: function () {

          this.init = function (context, inputCallback) {
            this._context = context;
            this._input = inputCallback;

            var symbol = PineJS.Std.ticker(this._context);
            var period = PineJS.Std.period(this._context);
            this._context.new_sym(symbol + "$OISYMBOL", period);
          };

          this.main = function (context, inputCallback) {
            this._context = context;
            this._input = inputCallback;
            this._context.select_sym(1);
            let length = this._input(0);
            let type = this._input(1);
            let OI = PineJS.Std.close(this._context);
            let OISeries = context.new_var(PineJS.Std.close(this._context));
            let MA;
            if (type == 'SMA') {
              MA = PineJS.Std.sma(OISeries, length, this._context);
            } else {
              MA = PineJS.Std.ema(OISeries, length, this._context);
            }
            if (isNaN(OI) || OI == 0) {
              return
            }
            return [OI, MA]
          };
        }
      });
    }
  },

  cpr = {
    getIndicatorTemplates: function (PineJS) {
      return common.setNameAndRequiredField("CPR with Pivot Level Daily", {
        metainfo: {
          _metainfoVersion: 51,
          id: 'CPRwithPivotLevelDaily@tv-basicstudies-1',
          description: 'CPR with Pivot Level Daily',
          shortDescription: 'CPR with Pivot Level Daily',
          is_hidden_study: false,
          is_price_study: true,
          isCustomIndicator: true,
          format: {
            type: 'price',
            precision: 2,
          },

          plots: [{ id: 'daily_pivot', type: 'line' }, { id: 'high', type: 'line' }, { id: 'low', type: 'line' },
          { id: 'daily_bc', type: 'line' }, { id: 'daily_tc', type: 'line' },
          { id: 'daily_s1', type: 'line' }, { id: 'daily_r1', type: 'line' }, { id: 'daily_s2', type: 'line' },
          { id: 'daily_r2', type: 'line' }, { id: 'daily_s3', type: 'line' }, { id: 'daily_r3', type: 'line' },
          { id: 'daily_s4', type: 'line' }, { id: 'daily_r4', type: 'line' }],
          defaults: {
            styles: {
              daily_pivot: {
                linestyle: 0,
                visible: true,
                linewidth: 3,
                plottype: 6,
                trackPrice: false,
                color: '#F8AF85'
              },
              daily_bc: {
                linestyle: 0,
                visible: true,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#9C50E4'
              },
              daily_tc: {
                linestyle: 0,
                visible: true,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#91A9F1'
              },
              high: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#6cac6e'
              },
              low: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#eb2d2d'
              },
              daily_s1: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#FF0000'
              },
              daily_r1: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#008000'
              },
              daily_s2: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#FF0000'
              },
              daily_r2: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#008000'
              },
              daily_s3: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#FF0000'
              },
              daily_r3: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#008000'
              },
              daily_s4: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#FF0000'
              },
              daily_r4: {
                linestyle: 0,
                visible: false,
                linewidth: 3,
                plottype: 6,

                // Show price line?
                trackPrice: false,

                // Plot color
                color: '#008000'
              },

            },
            precision: 2,
            inputs: {}
          },
          styles: {
            daily_pivot: {
              title: 'Daily Central Pivot',
              histogramBase: 1,
            }, high: {
              title: 'Prev Day High',
              histogramBase: 1,
            }, low: {
              title: 'Prev Day Low',
              histogramBase: 1,
            }, daily_bc: {
              title: 'Daily Bottom Pivot',
              histogramBase: 1,
            }, daily_tc: {
              title: 'Daily Top Pivot',
              histogramBase: 1,
            }, daily_s1: {
              title: 'Daily S1',
              histogramBase: 1,
            }, daily_r1: {
              title: 'Daily R1',
              histogramBase: 1,
            }, daily_s2: {
              title: 'Daily S2',
              histogramBase: 1,
            }, daily_r2: {
              title: 'Daily R2',
              histogramBase: 1,
            }, daily_s3: {
              title: 'Daily S3',
              histogramBase: 1,
            }, daily_r3: {
              title: 'Daily R3',
              histogramBase: 1,
            }, daily_s4: {
              title: 'Daily S4',
              histogramBase: 1,
            }, daily_r4: {
              title: 'Daily R4',
              histogramBase: 1,
            }
          },
          'inputs': [],
        },

        constructor: function () {
          this.init = async function (context, inputCallback) {
            this._context = context;
            this._input = inputCallback;
            var symbol = PineJS.Std.ticker(this._context);
            var period = PineJS.Std.period(this._context);
            period = period[period.length - 1];
            await this._context.new_sym(symbol + "$OISYMBOL", period);
          };

          this.main = function (context, inputCallback) {
            try {
              this._context = context;
              this._input = inputCallback;

              this._context.select_sym(0);

              let barTime = PineJS.Std.time(this._context);
              if (isNaN(barTime)) return
              let dayDiff = (new Date().getTime() - barTime) / (1000 * 3600 * 24);
              if (dayDiff > 30) return;
              let tempObj = {};
              try {
                let dateTime = customeMapDateFormatter(barTime);

                let symbol = this._context.symbol.ticker;
                symbol = symbol.split(':')[1];
                symbol = symbol.includes("$OISYMBOL") ? symbol.replace("$OISYMBOL", "") : symbol;

                if (!dayWiseDataMap[symbol]) return NaN;
                if (!dayWiseDataMap[symbol][dateTime]) {
                  let lastItem = dayWiseDataMap[symbol].dataArray[0];
                  tempObj.prevData = {
                    open: lastItem.open,
                    close: lastItem.close,
                    high: lastItem.high,
                    low: lastItem.low,
                  };
                }


                let data = dayWiseDataMap[symbol][dateTime] ? dayWiseDataMap[symbol][dateTime] : tempObj;
                if (!data.prevData) return NaN;
                let prev_day_high = data.prevData.high;

                let prev_day_low = data.prevData.low;

                let prev_day_close = data.prevData.close;

                let daily_pivot = (prev_day_high + prev_day_low + prev_day_close) / 3;
                let daily_bc = (prev_day_high + prev_day_low) / 2;
                let daily_tc = 2 * daily_pivot - daily_bc;
                let daily_r1 = 2 * daily_pivot - prev_day_low;
                let daily_r2 = daily_pivot + prev_day_high - prev_day_low;
                let daily_r3 = daily_r1 + prev_day_high - prev_day_low;
                let daily_r4 = daily_r3 + daily_r2 - daily_r1;
                let daily_s1 = 2 * daily_pivot - prev_day_high;
                let daily_s2 = daily_pivot - prev_day_high + prev_day_low;
                let daily_s3 = daily_s1 - prev_day_high + prev_day_low;
                let daily_s4 = daily_s3 + daily_s2 - daily_s1;
                return [daily_pivot, prev_day_high, prev_day_low, daily_bc, daily_tc, daily_s1, daily_r1, daily_s2,
                  daily_r2, daily_s3, daily_r3, daily_s4, daily_r4]
              } catch (e) {
                console.error("catch 1", e)
                return [NaN]
              }

            } catch (e) {
              console.error("catch 2", e)
              return [NaN]
            }
          };
        }
      })
    }
  },

  high_low_yesterday = {
    getIndicatorTemplates: function (PineJS) {
      return common.setNameAndRequiredField("High Low Yesterday", {
        metainfo: {
          _metainfoVersion: 52,
          id: 'high_low_yesterday@tv-basicstudies-1',
          description: 'High Low Yesterday',
          shortDescription: 'High Low Yesterday',
          is_hidden_study: false,
          is_price_study: true,
          isCustomIndicator: true,
          format: {
            type: 'inherit'
          },

          plots: [{ id: 'yesterday_high', type: 'line' }, { id: 'yesterday_low', type: 'line' }, {
            id: 'filler',
            type: 'colorer',
            target: 'filledAreaId1',
            palette: 'paletteId1',
            transparency: 80
          }],
          filledAreas: [
            {
              id: 'filledAreaId1',
              objAId: 'yesterday_high',
              objBId: 'yesterday_low',
              title: 'Filled area between first and second plot',
              type: 'plot_plot',
              palette: 'paletteId1',
              transparency: 80
            },
          ],

          palettes: {
            paletteId1: {
              valToIndex: {
                0: 0,
                1: 1,
              },
              colors: {
                0: {
                  name: 'First color',
                },
                1: {
                  name: 'Second color',
                },
              },
            },
          },
          defaults: {
            filledAreasStyle: {
              filledAreaId1: {
                color: 'yellow',
                visible: true,
                transparency: 80,
              },
            },

            palettes: {
              paletteId1: {
                colors: {
                  0: {
                    color: '#CD5C5C',
                    width: 1,
                    style: 0,
                    transparency: 80

                  },
                  1: {
                    color: '#3CB371',
                    width: 3,
                    style: 1,
                    transparency: 80
                  },
                },
              },
            },
            styles: {
              yesterday_high: {
                linestyle: 0,
                visible: true,
                linewidth: 2,
                plottype: 9,
                transparency: 0,
                trackPrice: false,
                color: '#3CB371'
              },
              yesterday_low: {
                linestyle: 0,
                visible: true,
                linewidth: 2,
                plottype: 9,
                transparency: 0,
                trackPrice: false,
                color: '#CD5C5C'
              },
            },
            inputs: {}
          },
          styles: {
            yesterday_high: {
              title: 'Yesterday High',
              histogramBase: 0,
              joinPoints: false,
              isHidden: false
            }, yesterday_low: {
              title: 'Yesterday Low',
              histogramBase: 0,
              joinPoints: false,
              isHidden: false
            }
          },
          'inputs': [],
        },

        constructor: function () {
          this.init = async function (context, inputCallback) {
            this._context = context;
            this._input = inputCallback;
            var symbol = PineJS.Std.ticker(this._context);
            var period = PineJS.Std.period(this._context);
            if (period.from) period.from = period.from - 320000
            await this._context.new_sym(symbol, period);
          };

          this.main = function (context, inputCallback) {
            try {
              let dateTime;
              let tempObj = {};
              let barTime = PineJS.Std.time(this._context);
              let symbol = this._context.symbol.ticker;
              symbol = symbol.split(':')[1];
              symbol = symbol.includes("$OISYMBOL") ? symbol.replace("$OISYMBOL", "") : symbol;
              dateTime = customeMapDateFormatter(barTime);
              this._context = context;
              this._input = inputCallback;
              if (!dayWiseDataMap[symbol]) return NaN;
              if (!dayWiseDataMap[symbol][dateTime]) {
                let lastItem = dayWiseDataMap[symbol].dataArray[0];
                tempObj.prevData = {
                  open: lastItem.open,
                  close: lastItem.close,
                  high: lastItem.high,
                  low: lastItem.low,
                };
              }
              let data = dayWiseDataMap[symbol][dateTime] ? dayWiseDataMap[symbol][dateTime] : tempObj;
              if (!data.prevData) return NaN;
              let prev_day_high = data.prevData.high;

              let prev_day_low = data.prevData.low;

              var close = PineJS.Std.close(this._context)
              var coler = close > prev_day_high ? 1 : 0

              try {
                return [prev_day_high, prev_day_low, coler]
              } catch (e) {
                console.error("catch 1", e)
                return [NaN]
              }

            } catch (e) {
              return [NaN]
            }
          };
        }
      })
    }
  },

  range_breakout = {
    getIndicatorTemplates: function (PineJS) {
      return common.setNameAndRequiredField("Opening Range", {
        metainfo: {
          _metainfoVersion: 52,
          id: 'OpeningRangeBreakout@tv-basicstudies-1',
          description: 'Opening Range',
          shortDescription: 'Opening Range',
          is_hidden_study: false,
          is_price_study: true,
          isCustomIndicator: true,
          format: {
            type: 'inherit'
          },

          plots: [{ id: 'range_high', type: 'line' }, { id: 'range_low', type: 'line' }],
          defaults: {
            styles: {
              range_high: {
                linestyle: 0,
                visible: true,
                linewidth: 2,
                plottype: 6,
                transparency: 0,
                trackPrice: false,
                color: '#3CB371'
              },
              range_low: {
                linestyle: 0,
                visible: true,
                linewidth: 2,
                plottype: 6,
                transparency: 0,
                trackPrice: false,
                color: '#CD5C5C'
              },
            },
            inputs: {
              hour: 9,
              minute: 15
            }
          },
          styles: {
            range_high: {
              title: 'ORB High',
              histogramBase: 0,
              joinPoints: false,
              isHidden: false
            }, range_low: {
              title: 'ORB Low',
              histogramBase: 0,
              joinPoints: false,
              isHidden: false
            }
          },
          'inputs': [
            { id: "hour", name: "Hour", type: "integer", isHidden: false, defval: 9, min: 1, max: 24, step: 1 },
            { id: "minute", name: "Minute", type: "integer", isHidden: false, defval: 15, min: 0, max: 60, step: 5 }
          ],
        },

        constructor: function () {
          this.init = async function (context, inputCallback) {
            this._context = context;
            this._input = inputCallback;
            var symbol = PineJS.Std.ticker(this._context);
            var period = PineJS.Std.period(this._context);
            if (period.from) period.from = period.from - 320000
            await this._context.new_sym(symbol, period);
          };

          this.main = function (context, inputCallback) {
            try {
              let dateTime;
              let barTime = PineJS.Std.time(this._context);
              dateTime = customeMapDateFormatter(barTime);
              if (!dayWiseRangeMap[dateTime]) dayWiseRangeMap[dateTime] = {}
              if (!dayWiseRangeMap[dateTime].high) dayWiseRangeMap[dateTime].high = ''
              if (!dayWiseRangeMap[dateTime].low) dayWiseRangeMap[dateTime].low = ''
              this._context = context;
              this._input = inputCallback;
              this._context.select_sym(0);
              var hour = this._input(0) < 10 ? "0" + this._input(0) : this._input(0);
              var minute = this._input(1) < 10 ? "0" + this._input(1) : this._input(1);
              var startminute = parseInt(minute) - 1
              var endminute = parseInt(minute) + 1
              if (isNaN(barTime)) return
              let startTime = hour + ":" + startminute
              let endTime = hour + ":" + endminute;
              let currentDate = new Date(barTime)
              let startDate = new Date(currentDate.getTime());
              startDate.setHours(startTime.split(":")[0]);
              startDate.setMinutes(startTime.split(":")[1]);
              let endDate = new Date(currentDate.getTime());
              endDate.setHours(endTime.split(":")[0]);
              endDate.setMinutes(endTime.split(":")[1]);
              let valid = startDate < currentDate && endDate > currentDate
              if (valid == true) {
                dayWiseRangeMap[dateTime].high = PineJS.Std.high(this._context);
                dayWiseRangeMap[dateTime].low = PineJS.Std.low(this._context);
              }
              try {
                if (dayWiseRangeMap[dateTime].high && dayWiseRangeMap[dateTime].low && startDate < currentDate) {
                  return [dayWiseRangeMap[dateTime].high, dayWiseRangeMap[dateTime].low]
                }
                else {
                  return [NaN, NaN]
                }
              } catch (e) {
                return [NaN]
              }

            } catch (e) {
              return [NaN]
            }
          };
        }
      })
    }
  },

  macd_c4 = {
    getIndicatorTemplates: function (PineJS) {
      return common.setNameAndRequiredField("MACD 4C", {
        metainfo: {
          _metainfoVersion: 52,
          id: 'macd_4c@tv-basicstudies-1',
          description: 'MACD 4C',
          shortDescription: 'MACD 4C',
          is_hidden_study: false,
          is_price_study: false,
          isCustomIndicator: true,
          format: {
            type: 'inherit'
          },

          plots: [{ id: 'macd_histogram', type: 'line' }, { id: 'signal', type: 'line' }, {
            id: "plot_3",
            palette: "palette_0",
            target: "macd_histogram",
            type: "colorer",
          }],

          palettes: {
            palette_0: {
              colors: {
                0: { name: "Color 0" },
                1: { name: "Color 1" },
                2: { name: "Color 2" },
                3: { name: "Color 3" },
              },
            },
          },
          defaults: {
            styles: {
              macd_histogram: {
                linestyle: 0,
                visible: true,
                linewidth: 2,
                plottype: 5,
                transparency: 0,
                trackPrice: false,
                color: '#3CB371'
              },
              signal: {
                linestyle: 0,
                visible: true,
                linewidth: 2,
                plottype: 0,
                transparency: 0,
                trackPrice: false,
                color: 'white'
              },
            },
            palettes: {
              palette_0: {
                colors: {
                  0: { color: 'lime', width: 1, style: 0 },
                  1: { color: 'green', width: 1, style: 0 },
                  2: { color: 'maroon', width: 1, style: 0 },
                  3: { color: "red", width: 1, style: 0 },
                },
              },
            },
            inputs: { in_0: 12, in_1: 26, in_3: "close", in_2: 9 }
          },
          styles: {
            macd_histogram: {
              title: 'Histogram',
              histogramBase: 0,
              joinPoints: false,
              isHidden: false
            }, signal: {
              title: 'Signal',
              histogramBase: 0,
              joinPoints: false,
              isHidden: false
            }
          },

          inputs: [
            {
              id: "in_0",
              name: "Fast Length",
              defval: 12,
              type: "integer",
              min: 1,
              max: 2e3,
            },
            {
              id: "in_1",
              name: "Slow Length",
              defval: 26,
              type: "integer",
              min: 1,
              max: 2e3,
            },
            {
              id: "in_2",
              name: "Signal Length",
              defval: 9,
              type: "integer",
              min: 1,
              max: 50,
            },
          ],
        },

        constructor: function () {
          this.prev = prev;
          (this.f_0 = function (e, t) {
            return e - t;
          }),
            (this.f_1 = function (curr, prev) {
              let plotColor = curr > 0
                ? curr > prev ? 0 : 1
                : curr < prev ? 2 : 3
              return plotColor
            }),
            this.main = function (e, t) {
              (this._context = e), (this._input = t);
              var i = PineJS.Std.close(this._context),
                s = this._input(0),
                n = this._input(1),
                o = this._input(2);
              this._context.setMinimumAdditionalDepth(Math.max(s, n) + o);
              var a = this._context.new_var(i),
                l = PineJS.Std.ema(a, s, this._context),
                c = this._context.new_var(i),
                h = PineJS.Std.ema(c, n, this._context),
                d = this.f_0(l, h)
              var color = this.f_1(d, this.prev);
              this.prev = d;
              let u = this._context.new_var(d),
                p = PineJS.Std.sma(u, o, this._context);
              try {
                return [d, p, color];
              } catch (e) {
                console.error("catch 1", e)
                return [NaN]
              }
            };
        }
      })
    }
  },

  smi = function () {
    return {
      getIndicatorTemplates: function () {
        var indicatorTemplate = {
          metainfo: {
            defaults: {
              inputs: [
                { id: "BB Length", name: "BB Length", type: "integer", isHidden: false, defval: 20 },
                { id: "BB MultFactor", name: "BB MultFactor", type: "float", isHidden: false, defval: 2.0 },
                { id: "KC Length", name: "KC Length", type: "integer", isHidden: false, defval: 20 },
                { id: "KC MultFactor", name: "KC MultFactor", type: "float", isHidden: false, defval: 1.5 },
                { id: "Use TrueRange (KC)", name: "Use TrueRange (KC)", type: "boolean", isHidden: false, defval: true }]
            }
          }
        }
        return common.setNameAndRequiredField("Squeeze Momentum Indicator", indicatorTemplate);
      }
    }

  },
  ohCL = function () {
    const plots = { previous_day_high: "#4CAF50", previous_day_close: "#2196F3", previous_day_open: "#00BCD4", previous_day_low: "#FF5252" };
    return {
      getIndicatorTemplates: function (PineJS) {
        var indicatorTemplate = {
          metainfo: { plots: common.getPlots(plots), defaults: { styles: common.getDefaultStyle(plots), precision: 2, inputs: {} }, styles: common.getStyle(plots), inputs: [] }, constructor: function () {
            this.init = function (context, inputCallback) {
              var symbol
              this._context = context, this._input = inputCallback, symbol = PineJS.Std.ticker(this._context), this._context.new_sym(symbol, PineJS.Std.period(this._context));
            }, this.main = function (context, inputCallback) {
              try {
                this._context = context, this._input = inputCallback, this._context.select_sym(1);
                var time = PineJS.Std.time(this._context);
                var prev_day_high, prev_day_low, prev_day_close, prev_day_open
                if (isNaN(time)) return [NaN];
                var curDate = customIndicator.getDateMonthYear(time), symbol = PineJS.Std.ticker(this._context), curMapping = customIndicator["getMapping"]()[symbol][curDate];
                if (!curMapping) return [NaN];
                var previousDate = curMapping.previousDate, prevMapping = customIndicator["getMapping"]()[symbol][previousDate];
                return prevMapping ? (prev_day_high = prevMapping.high, prev_day_low = prevMapping.low, prev_day_close = prevMapping.close, prev_day_open = prevMapping.open, [prev_day_high, prev_day_close, prev_day_open, prev_day_low]) : [NaN];
              } catch (error) {
                return console.log("Error ohcl module indicator: ", error), [NaN];
              }
            };
          }
        };
        return common.setNameAndRequiredField("Previous day OHLC", indicatorTemplate);
      }
    };
  }(),
  anchor = {
    getIndicatorTemplates: function (PineJS) {
      return common.setNameAndRequiredField("Anchor VWAP", {
        metainfo: {
          _metainfoVersion: 52,
          id: 'Anchor VWAP@tv-basicstudies-1',
          description: 'Anchor VWAP',
          shortDescription: 'Anchor VWAP',
          is_hidden_study: false,
          is_price_study: true,
          isCustomIndicator: true,
          format: {
            type: 'inherit'
          },

          plots: [{ id: "plot_0", type: "line" }],
          defaults: {
            styles: {
              plot_0: {
                linestyle: 0,
                linewidth: 1,
                plottype: 0,
                trackPrice: 0,
                transparency: 0,
                visible: !0,
                color: "#2196F3",
              },
            },
            inputs: { in_0: "hlc3", in_anchor: "Session" },
          },
          styles: {
            plot_0: {
              title: "VWAP",
              histogramBase: 0,
              joinPoints: !1,
              isHidden: !1,
            },
          },
          inputs: [
            {
              id: "in_0",
              name: "Source",
              defval: "hlc3",
              type: "source",
              options: [
                "open",
                "high",
                "low",
                "close",
                "hl2",
                "hlc3",
                "ohlc4",
              ],
            },
            {
              id: "in_anchor",
              name: "Anchor Period",
              defval: "Session",
              type: "text",
              options: [
                "Session",
                "Week",
                "Month",
                "Year"
              ],
            },
          ],
        },
        constructor: function () {
          (this.f_1 = function (context) {
            context.reset_hist();
          }),

            (this.createAnchorChecker = function (context, inputCallback) {//context e, inputCallback  t
              switch (inputCallback) {
                case "Week":
                  return function (inputCallback, i) {
                    return (
                      PineJS.Std.weekofyear(context, inputCallback) !== PineJS.Std.weekofyear(context, i) ||
                      PineJS.Std.year(context, inputCallback) !== PineJS.Std.year(context, i)
                    );
                  };
                case "Month":
                  return function (inputCallback, i) {
                    return (
                      PineJS.Std.month(context, inputCallback) !== PineJS.Std.month(context, i) ||
                      PineJS.Std.year(context, inputCallback) !== PineJS.Std.year(context, i)
                    );
                  };
                case "Year":
                  return function (inputCallback, i) {
                    return PineJS.Std.year(context, inputCallback) !== PineJS.Std.year(context, i);
                  };
                default:
                  return (context) => this._isNewSession(context);
              }
            }),

            this.init = function (context, inputCallback) {
              this._context = context;
              this._input = inputCallback;
              this._isNewSession = null;
              const userInput = this._input(1) || "Session";
              this._anchorChecker = this.createAnchorChecker(context, userInput);
            };

          this.main = function (context, inputCallback) {
            this._context = context;
            this._input = inputCallback;
            const source = this._input(0);
            var s = context.new_var(),
              n = context.new_var();
            const currBarTime = PineJS.Std.time(this._context),
              a = this._context.new_unlimited_var(currBarTime);


            return (
              currBarTime &&
              (null === this._isNewSession &&
                (this._isNewSession = PineJS.Std.createNewSessionCheck(context)),
                this._anchorChecker(a.get(), a.get(1)) &&
                (this.f_1(s), this.f_1(n))),
              s.set(
                PineJS.Std.nz(s.get(1)) +
                PineJS.Std[source](this._context) * PineJS.Std.volume(this._context)
              ),
              n.set(PineJS.Std.nz(n.get(1)) + PineJS.Std.volume(this._context)),
              [s.get(0) / n.get(0)]
            );

          };
        },
      })
    }
  }

async function getHistoryData(symbolInfo, resolution, periodParams) {
  var data11;
  var requestOptions = JSON.stringify({ "sym": symbolInfo.name, "from": periodParams.from, "to": periodParams.to })
  data11 = await makeApiRequest(`${myntDCUrl}getdata`, requestOptions);
  if (data11.length > 0) {
    data11 = await data11.map(JSON.parse);
    // data11=JSON.parse(data11)
  } else {
    // onHistoryCallback([], { noData: true });
    return;
  }
  try {
    if (data11.stat == 'Not_Ok' || data11 == []) {
      // onHistoryCallback([], { noData: true });
      return;
    }
    let data = data11.map(d => {
      return { time: parseFloat(d.ssboe), open: parseFloat(d.into), high: parseFloat(d.inth), low: parseFloat(d.intl), close: parseFloat(d.intc), volume: parseFloat(d.intv), oi: parseFloat(d.intv) }
    });
    data = data.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

    return data
    // onHistoryCallback(bars, { noData: false });

  } catch (error) {
    // onErrorCallback(error);
  }

}

function customeMapDateFormatter(date) {
  date = new Date(date);
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let year = date.getFullYear();
  return month + "/" + day + "/" + year;
}

export async function getcprData(symbolInfo, periodParams, token) {
  let symName = symbolInfo.exchange + ":" + symbolInfo.base_name
  symName = symName.includes("$OISYMBOL") ? symName.replace("$OISYMBOL", "") : symName;
  symName = symName.includes(" ") ? symName.replace(" ", "%20") : symName;
  symName = symName.includes("&") ? symName.replace("&", "%26") : symName;
  let requestOptions = `jData={"sym":"${symName}","from":"${periodParams.from - 31556926}","to":"${periodParams.to}"}&jKey=${token}`
  // Check if API URL is ready before making request
  const apiUrl = params ? myntappurl.myntapi : mynturl.myntapi;
  if (!apiUrl) {
    console.warn("⚠️ API URL not ready for EODChartData, returning empty data");
    return Promise.resolve("API URL not ready");
  }
  let data11 = await makeApiRequest(`${apiUrl}EODChartData`, requestOptions);
  if (data11.length > 0) {
    data11 = await data11.map(JSON.parse);
    mapCPRData(data11, symbolInfo.name)
  }
  else {
    Promise.resolve("Failed to fetch data");
  }

}

function mapCPRData(data, symbol) {
  symbol = symbol.split(':')[1];
  symbol = symbol.includes("$OISYMBOL") ? symbol.replace("$OISYMBOL", "") : symbol;
  let tempArray1 = [];
  let currTime = new Date().getTime();

  //Day Wise mapping
  try {
    if (!dayWiseDataMap[symbol]) {
      dayWiseDataMap[symbol] = {};
      dayWiseDataMap[symbol]["dataArray"] = [];
    } else {
      tempArray1 = dayWiseDataMap[symbol]["dataArray"];
    }
    for (let x = 0; x < data.length; x++) {
      let dayDiff = (currTime - data[x]['time']) / (1000 * 3600 * 24);
      if (dayDiff > 30) continue;
      let tempObj = data[x];
      let dateTime = customeMapDateFormatter(data[x]['time']);
      if (!dayWiseDataMap[symbol][dateTime]) {
        dayWiseDataMap[symbol][dateTime] = {
          open: Number(tempObj['into']),
          high: Number(tempObj['inth']),
          low: Number(tempObj['intl']),
          close: Number(tempObj['intc']),
          time: tempObj['time'],
          volume: Number(tempObj['intv']),
          dateTime: dateTime,
          date: new Date(dateTime)
        };
        tempArray1.push(dayWiseDataMap[symbol][dateTime]);

      } else {
        dayWiseDataMap[symbol][dateTime]['high'] = Math.max(dayWiseDataMap[symbol][dateTime]['high'], Number(tempObj['inth']));
        dayWiseDataMap[symbol][dateTime]['low'] = Math.min(dayWiseDataMap[symbol][dateTime]['low'], Number(tempObj['intl']));
        dayWiseDataMap[symbol][dateTime]['close'] = Number(tempObj['intc']);
        dayWiseDataMap[symbol][dateTime]['volume'] += Number(tempObj['intv']) * 1;
        tempArray1.filter(data => {
          if (data.dateTime == dateTime) {
            data.high = dayWiseDataMap[symbol][dateTime]['high'];
            data.low = dayWiseDataMap[symbol][dateTime]['low'];
            data.close = dayWiseDataMap[symbol][dateTime]['close'];
            data.volume = dayWiseDataMap[symbol][dateTime]['volume'];
          }
        });
      }
    }
    tempArray1 = tempArray1.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    for (let y = 1; y < tempArray1.length; y++) {
      let time = tempArray1[y]['dateTime'];
      dayWiseDataMap[symbol][time]["prevData"] = {
        open: tempArray1[y - 1]["open"],
        high: tempArray1[y - 1]["high"],
        low: tempArray1[y - 1]["low"],
        close: tempArray1[y - 1]["close"],
        volume: tempArray1[y - 1]["volume"],
      };
    }
    dayWiseDataMap[symbol]["dataArray"] = tempArray1.reverse();
  } catch (e) {
    console.error(e);
  }
}