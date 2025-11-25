<template>
  <div class="tradingview-wrapper elevation-0" :class="{ active: activeTVChartSection }">
    <!-- chartLayoutType ::::  {{ chartLayoutType }} -->
    <div v-if="!activeTVChartSection" class="tvChart-overlay-detect" @click="captureSelectedTVChart"></div>

    <div :id="containerId"
      :class="chartLayoutType == 1 || chartLayoutType == 2 ? 'mono-TVChartContainer' : 'trio-TVChartContainer'"></div>

    <!-- <v-card v-if="showchart" color="cardbg" width="100%" 
        class="pos-abs elevation-0 rounded-0 text-center " :style="{ top: 0, left: 0 }">
        <v-progress-circular class="my-auto" color="primary" :size="60" :width="4" indeterminate
          :style="{ top: '40%' }"></v-progress-circular>
      </v-card> -->

  </div>
</template>

<script>
import { widget } from "../../public/charting_library";
import Datafeed from "../components/mixins/feedFactory.js";
import { setIndicators, getIndicators } from "./mixins/getAPIdata";

export default {
  name: "TVMultiChartContainer",

  props: {
    symbol: {
      default: localStorage.getItem("ssdtsym"),
      type: String,
    },
    chartLayoutType: {
      default: 1,
      type: Number,
    },
    containerId: {
      default: "tv_chart_1",
      type: String,
    },
    datafeedUrl: {
      default: "",
      type: String,
    },
    libraryPath: {
      default: "../charting_library/",
      type: String,
    },
    chartsStorageUrl: {
      default: "https://chartbe.mynt.in",
      type: String,
    },
    chartsStorageApiVersion: {
      default: "1.1",
      type: String,
    },
    clientId: {
      default: "ZEBU",
      type: String,
    },
    userId: {
      default: "",
      type: String,
    },
    fullscreen: {
      default: false,
      type: Boolean,
    },
    autosize: {
      default: true,
      type: Boolean,
    },
    tvWidgetCount: {
      default: 1,
      type: Number,
    },
    studiesOverrides: {
      type: Object,
    },
    //  isActive: {
    //   type: Boolean,
    //   default: false
    // },
    title: String,
    subtitle: String,
    text: String,
    image: String,
  },
  // tvWidget: null,

  data() {
    return {
      activeTVChartSection: false,
      showchart: true,
      theme: "light",
      savedSymbol: "",
      settings: JSON.parse(localStorage.getItem("settings")),
      interval: "1",

      openInterestData: [],
      oiloader: false,
    };
  },

  mounted() {
    this.interval = this.settings && this.settings["chart.lastUsedTimeBasedResolution"] ? this.settings["chart.lastUsedTimeBasedResolution"] : "5";
    this.initTWChart(localStorage.getItem("adv_chart"));

    var sss = [];
    if (this.settings) {
      for (let i in this.settings) {
        if (i.includes("savedwatch")) {
          delete this.settings[i];
        }
      }
      sss = this.settings;
    } else {
      sss = {};
    }
    localStorage.setItem("settings", JSON.stringify(sss));

    // eventBus.$on("ssd-event", (type, token, exch, tsym) => {
    //   window[this.containerId].activeChart().setSymbol(`${exch}:${tsym}`);
    // });
    //  window[this.containerId].activeChart().setSymbol(`NSE:Nifty Bank`);
  },
  beforeDestroy() {
    // eventBus.$off('ssd-event');
  },

  methods: {
    captureSelectedTVChart() {
      window.dispatchEvent(new CustomEvent('section-clicked', {
        detail: { containerId: this.containerId }
      }))

      const sectionClickHandler = (event) => {
        const containerId = event.detail?.containerId
        if (containerId === this.containerId) {
          this.activeTVChartSection = true;
        } else {
          this.activeTVChartSection = false;
        }
        // console.log("containerId on :::: current",this.containerId,"  next : ",containerId)
      }
      window.addEventListener('section-clicked', sectionClickHandler)
    },


    async setIndicatorsInterval(containerId) {
      var indicators = await getIndicators();
      setInterval(async function () {
        // Check if widget exists and is ready before accessing
        if (!window[containerId] || !window[containerId].activeChart) {
          return;
        }
        
        try {
          var d = window[containerId].activeChart().getAllStudies();
          var c = [];
          for (var i = 0; i < d.length; i++) {
            var a = d[i].name;
            if (a != "Volume") {
              c.push(a);
            }
          }
          if (JSON.stringify(indicators.data) != JSON.stringify(c)) {
            try {
              let res = await setIndicators(c)
              indicators = res;
            }
            catch (e) {
              // console.log(e);
            }
          }
        } catch (e) {
          // Chart not ready yet, skip this interval
        }
      }, 5000);

      // Check if widget is ready before creating studies
      if (indicators.data && window[containerId] && window[containerId].activeChart) {
        try {
          for (var i = 0; i < indicators.data.length; i++) {
            // console.log(indicators['data'][0])
            window[containerId].activeChart().createStudy(indicators['data'][i], false, false);
          }
        } catch (e) {
          // Chart not ready, studies will be added later
        }
      }
    },

    initTWChart(type) {
      // console.log("initTWChart ::: ",this.containerId)

      let sym = localStorage.getItem("ssdtsym");
      // Validate symbol format (must contain colon, e.g., "NSE:TCS-EQ")
      if (!sym || !sym.includes(':') || sym.toLowerCase().includes('undefined')) {
        sym = this.symbol || 'NSE:NIFTY 50'; // Fallback to a default symbol
      }
      const widgetOptions = {
        symbol: sym,
        datafeed: Datafeed,
        interval: this.interval,
        // timeframe: "5D",
        container: this.containerId,
        auto_save_delay: 1,
        library_path: this.libraryPath,
        timezone: "Asia/Kolkata",
        locale: "en",
        custom_css_url: "../css/style.css",
        // load_last_chart: true,
        disabled_features: ["timeframes_toolbar", "symbol_info", "header_compare", "end_of_period_timescale_marks", "header_symbol_search"], //"left_toolbar","bottom_toolbar","header_widget", "header_symbol_search"


        enabled_features: ["study_templates", "use_localstorage_for_settings", "iframe_loading_compatibility_mode", "iframe_loading_compatibility_mode", "custom_resolutions"

          , "header_saveload",

        ],
        charts_storage_url: "https://chartbe.mynt.in",
        charts_storage_api_version: this.chartsStorageApiVersion,
        client_id: "Mynt_web",
        user_id: "",
        fullscreen: this.fullscreen,
        autosize: this.autosize,
        // debug:true,
        studies_overrides: this.studiesOverrides,
        theme: this.$vuetify.theme.dark ? "light" : "dark",
        settings_adapter: {
          initialSettings: this.settings,
          setValue: function (key, value) {
            let settings;
            if (localStorage.getItem("settings") != undefined) {
              settings = JSON.parse(localStorage.getItem("settings"));
              if (settings[key]) {
                settings[key] = value;
              } else {
                settings[key] = value;
              }
            } else {
              settings[key] = value;
            }
            localStorage.setItem("settings", JSON.stringify(settings));
          },
          removeValue: function (key) {
            let settings = JSON.parse(localStorage.getItem("settings"));
            delete settings[key];
            localStorage.setItem("settings", JSON.stringify(settings));
          },
        },
        // right side widget to watchlist
        widgetbar: {
          details: false,
          news: false,
          watchlist: false,
          datawindow: false,
          watchlist_settings: {
            default_symbols: [],
            readonly: false,
          },
        },
      };

      const uid = sessionStorage.getItem("userid");
      widgetOptions['user_id'] = uid;

      window[this.containerId] = new widget(widgetOptions);
      // window[this.containerId] = tvWidget;
      // this[this.containerId] = tvWidget;
      // console.log("initTWChart after window widget add ::: ", this.containerId, window[this.containerId])

      // const self = this;
      window[this.containerId].onChartReady(() => {
        window[this.containerId].changeTheme(this.$vuetify.theme.dark ? "dark" : "light");
        setTimeout(() => {
          window[this.containerId].activeChart().applyOverrides({
            "paneProperties.background": this.$vuetify.theme.dark ? "#121212" : "#ffffff",
            "paneProperties.backgroundGradientEndColor": this.$vuetify.theme.dark ? "#121212" : "#ffffff",
            "paneProperties.backgroundGradientStartColor": this.$vuetify.theme.dark ? "#121212" : "#ffffff",

            // "paneProperties.horzGridProperties.color": this.$vuetify.theme.dark ? "#131722" : "rgba(42, 46, 57, 0.06)",
            // "paneProperties.vertGridProperties.color": this.$vuetify.theme.dark ? "#131722" : "rgba(42, 46, 57, 0.06)",
            // "scalesProperties.lineColor": this.$vuetify.theme.dark ? "#131722" : "rgba(42, 46, 57, 0)",
            // "scalesProperties.textColor": this.$vuetify.theme.dark ? "#B2B5BE" : "#131722",
            // ---

            "mainSeriesProperties.highLowAvgPrice.highLowPriceLinesVisible": true,
            "mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible": true,

            "scalesProperties.showStudyPlotLabels": false,
            "mainSeriesProperties.showCountdown": true,
            // "paneProperties.legendProperties.showSeriesTitle": false,
            "paneProperties.legendProperties.showStudyArguments": false,
            "mainSeriesProperties.statusViewStyle.showExchange": false,
            "mainSeriesProperties.statusViewStyle.showInterval": false,
          });
        }, 0);
        if (type != "0") {
          window[this.containerId].headerReady().then(() => {
            const refreshButton = window[this.containerId].createButton({ align: "right" });
            refreshButton.setAttribute("title", "Reset Chart");
            refreshButton.innerHTML =
              '<svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 19C5.5 20.6811 5.99852 22.3245 6.93251 23.7223C7.8665 25.1202 9.19402 26.2096 10.7472 26.853C12.3004 27.4963 14.0094 27.6646 15.6583 27.3367C17.3071 27.0087 18.8217 26.1992 20.0104 25.0104C21.1992 23.8217 22.0087 22.3071 22.3367 20.6583C22.6647 19.0094 22.4963 17.3004 21.853 15.7472C21.2096 14.194 20.1202 12.8665 18.7223 11.9325C17.3245 10.9985 15.6811 10.5 14 10.5H7.5" stroke="currentColor"/><path d="M11 14L7.5 10.5L11 7" stroke="currentColor"/></svg>';

            // const oiprofile = window[this.containerId].createButton({align: "left"});
            // oiprofile.setAttribute("title", "OI Profile");
            // oiprofile.innerHTML = "OI Profile";
            // oiprofile.addEventListener("click", () => {
            //   self.oiloader = true;
            //   self.getOidatas();
            //   // Render histogram initially
            //   self.window[this.containerId]
            //     .activeChart()
            //     .onVisibleRangeChanged()
            //     .subscribe(null, () => {
            //       self.renderHistogram();
            //     });

            //   self.window[this.containerId]
            //     .activeChart()
            //     .crossHairMoved()
            //     .subscribe(null, () => {
            //       self.renderHistogram();
            //     });
            // });

            refreshButton.addEventListener("click", () => {
              window[this.containerId].activeChart().resetData();
              window[this.containerId].activeChart().executeActionById("chartReset");
              // self.renderHistogram();
            });
          });
          window[this.containerId].onContextMenu(function (unixtime, price) {
            return [



              // {text: "-", position: "top"},
              // {text: "-Objects Tree..."},
              {
                position: "top",
                text: "Set Alert " + "(" + price?.toFixed(2) + ")",
                click: function Callback() {
                  window.dispatchEvent(new CustomEvent('menudialog', {
                    detail: {
                      type: 'alert',
                      token: localStorage.getItem("ssdtoken"),
                      exch: localStorage.getItem("ssdtsym")?.split(':')[0],
                      tsym: localStorage.getItem("ssdtsym")?.split(':')[1],
                      action: 'a',
                      data: { price: price?.toFixed(2) }
                    }
                  }))
                  // self.altsymbol = window[this.containerId].activeChart().symbol();
                  // self.alrprice = price?.toFixed(2);
                  // self.altconval = self.altconitem[0];
                  // self.alertval = self.alertitem[0];
                  // self.alertMet();
                },
              },
            ];
          });
        }

        window[this.containerId].activeChart().dataReady(() => {
          window[this.containerId].activeChart().executeActionById("chartReset");
        });
        this.showchart = false;
        this.setIndicatorsInterval(this.containerId);
      });
    },
  },

  destroyed() {
    if (window[this.containerId] !== null) {
      window[this.containerId].remove();
      window[this.containerId] = null;
    }
  },
};
</script>

<style lang="scss" scoped>
.tradingview-wrapper {
  position: relative !important;
  display: flex !important;
  width: 100% !important;

  border: 2px solid transparent;
  padding: 0px;
  margin: 0px;
  transition: border 0.3s;
}

.tradingview-wrapper.active {
  border-color: blue;
}

.tvChart-overlay-detect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: transparent;
  cursor: pointer;
}


// .TVChartContainer {
//   overflow: hidden !important;
//   height: 100vh !important;
//   width: 100% !important;
// }




.mono-TVChartContainer {
  overflow: hidden !important;
  height: 90vh !important;
  width: 100% !important;
}

.dio-TVChartContainer {
  overflow: hidden !important;
  height: 90vh !important;
  width: 100% !important;
}

.trio-TVChartContainer {
  overflow: hidden !important;
  height: 43vh !important;
  width: 100% !important;
}

.quadro-TVChartContainer {
  overflow: hidden !important;
  height: 43vh !important;
  width: 100% !important;
}
</style>
