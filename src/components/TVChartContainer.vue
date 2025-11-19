<template>
  <div>
    <v-progress-linear v-if="oiloader" color="primary" indeterminate rounded></v-progress-linear>

    <div class="tradingview-wrapper elevation-0">
      <div :id="containerId" class="chart-container"></div>
      <div id="histogram-container" class="histogram-container">
      </div>
      <v-card v-if="showchart" color="cardbg" width="100%" id="chartloader"
        class="pos-abs elevation-0 rounded-0 text-center" :style="{ top: 0, left: 0 }">
        <v-progress-circular class="my-auto" color="primary" :size="60" :width="4" indeterminate
          :style="{ top: '40%' }"></v-progress-circular>
      </v-card>
    </div>
  </div>
</template>

<script>
import { widget } from "../../public/charting_library";
import Datafeed from "../components/mixins/feedFactory.js";
// import eventBus from "../eventBus.js"; // Removed - using Pinia stores instead
import { getOIbars, setIndicators, getIndicators } from "./mixins/getAPIdata";
import { useAppStore } from "../stores/appStore";

export default {
  name: "TVSingleChartContainer",

  props: {
    symbol: {
      default: localStorage.getItem("ssdtsym"),
      type: String,
    },
    // interval: {
    //   default: "1",
    //   type: String,
    // },
    containerId: {
      default: "tv_chart_container",
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
    studiesOverrides: {
      type: Object,
    },
    title: String,
    subtitle: String,
    text: String,
    image: String,
  },
  tvWidget: null,

  data() {
    return {
      showchart: true,
      theme: "light",
      savedSymbol: "",
      settings: JSON.parse(localStorage.getItem("settings")),
      interval: "1",
      tvReady: false,
      pendingSymbol: null,

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

    // Listen for stock selection events via custom events
    window.addEventListener('ssd-event', (event) => {
      let detail = event.detail;
      let exch, tsym;
      
      // Handle both array format [type, token, exch, tsym] and object format {type, token, exch, tsym}
      if (Array.isArray(detail) && detail.length >= 4) {
        exch = detail[2];
        tsym = detail[3];
      } else if (detail && typeof detail === 'object' && detail.exch && detail.tsym) {
        exch = detail.exch;
        tsym = detail.tsym;
      } else {
        return; // Invalid format, ignore
      }
      
      if (!exch || !tsym) return;
      
      const symbol = `${exch}:${tsym}`;
      // Ensure localStorage is set for chart initialization
      localStorage.setItem('ssdtsym', symbol);
      if (detail.token || (Array.isArray(detail) && detail[1])) {
        localStorage.setItem('ssdtoken', detail.token || detail[1]);
      }
      
      if (this.tvReady && window.tvWidget && typeof window.tvWidget.activeChart === 'function') {
        try {
          window.tvWidget.activeChart().setSymbol(symbol);
          const container = document.getElementById("histogram-container");
          if (container) {
            container.innerHTML = "";
          }
        } catch (e) {
          this.pendingSymbol = symbol;
        }
      } else {
        // Queue the symbol until chart is ready
        this.pendingSymbol = symbol;
      }
    });
    //  window.tvWidget.activeChart().setSymbol(`NSE:Nifty Bank`);
  },
  beforeDestroy() {
    // eventBus.$off('ssd-event');
  },

  methods: {
    async setIndicatorsInterval() {
      var indicators = await getIndicators();

      setInterval(async function () {
        var d = window.tvWidget.activeChart().getAllStudies();
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
      }, 5000);

      if (indicators.data) {
        for (var i = 0; i < indicators.data.length; i++) {
          // console.log(indicators['data'][0])
          window.tvWidget.activeChart().createStudy(indicators['data'][i], false, false);
        }
      }
    },
    async getOidatas() {
      if (["NSE:NIFTY 50", "NSE:NIFTY BANK", "NSE:NIFTY FIN SERVICE", "NSE:NIFTY MID SELECT", "BSE:SENSEX", "BSE:BANKEX"].includes(this.tvWidget.activeChart().symbol())) {
        let oidatas = await getOIbars(["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "SENSEX", "BANKEX"][["NSE:NIFTY 50", "NSE:NIFTY BANK", "NSE:NIFTY FIN SERVICE", "NSE:NIFTY MID SELECT", "BSE:SENSEX", "BSE:BANKEX"].indexOf(this.tvWidget.activeChart().symbol())]);
        if (oidatas && oidatas.data && oidatas.data.length > 0) {
          this.openInterestData = oidatas.data;
          this.renderHistogram();
        }
      } else {
        const appStore = useAppStore();
        appStore.showSnackbar(2, `No OI Profile for ${this.tvWidget.activeChart().symbol()}`);
      }
      this.oiloader = false;
    },
    async renderHistogram() {
      if (this.openInterestData && this.openInterestData.length > 0) {
        const container = document.getElementById("histogram-container");
        container.innerHTML = ""; // Clear previous histogram bars

        const one = this.tvWidget.activeChart().getPanes()[0].getRightPriceScales()[0]._priceScale._markBuilder._marks;
        // Ensure container height is updated dynamically
        const chartContainer = document.getElementById(this.containerId);
        container.style.height = `${chartContainer.offsetHeight}px`;
        if (one && one.length > 0) {
          const callOIs = this.openInterestData.map((entry) => Number(entry.callOI));
          const putOIs = this.openInterestData.map((entry) => Number(entry.putOI));

          // Find min and max callOI
          const maxCallOI = Math.max(...callOIs);
          const maxputOI = Math.max(...putOIs);

          for (let i = 0; i < one.length; i++) {
            var idx = this.openInterestData.findIndex((p) => Number(p.price) == Number(one[i].label));
            if (idx >= 0) {
              var { price, callOI, putOI } = this.openInterestData[idx];
              price = Number(price);
              callOI = Number(callOI);
              putOI = Number(putOI);
              var c = Number(((callOI - maxCallOI) / maxCallOI) * 100 + 100)?.toFixed(0);
              var p = Number(((putOI - maxputOI) / maxputOI) * 100 + 100)?.toFixed(0);

              const yPosition = (Number(one[i].coord) + 30).toFixed(0);

              // Call OI bar
              const callBar = document.createElement("div");
              callBar.className = "histogram-bar";
              callBar.style.width = `${c}px`;
              callBar.style.height = `10px`;
              callBar.style.backgroundColor = "rgba(0, 128, 0, 0.5)";
              callBar.style.position = "absolute";
              callBar.style.top = `${yPosition}px`;
              callBar.style.right = "0";
              callBar.setAttribute("id", `${price}_c`);
              callBar.setAttribute("title", `Strike: ${price}, CallOI: ${(callOI / 100000).toFixed(2)}L, PutOI: ${(putOI / 100000).toFixed(2)}L`);

              // Put OI bar
              const putBar = document.createElement("div");
              putBar.className = "histogram-bar";
              putBar.style.width = `${p}px`;
              putBar.style.height = `10px`;
              putBar.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
              putBar.style.position = "absolute";
              putBar.style.top = `${yPosition}px`;
              putBar.style.left = "0";
              putBar.setAttribute("id", `${price}_p`);
              putBar.setAttribute("title", `Strike: ${price}, CallOI: ${(callOI / 100000).toFixed(2)}L, PutOI: ${(putOI / 100000).toFixed(2)}L`);

              container.appendChild(callBar);
              container.appendChild(putBar);
            }
          }
        }
      }
    },
    initTWChart(type) {
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
      const containerEl = document.getElementById(this.containerId);
      const loaderEl = document.getElementById("chartloader");
      if (!containerEl || !loaderEl) {
        // Container not yet in DOM; retry shortly rather than throwing
        setTimeout(() => this.initTWChart(type), 100);
        return;
      }
      var idx = containerEl.classList;
      var cht = loaderEl.classList;

      if (type == "0") {
        widgetOptions.disabled_features.push("header_widget");
        widgetOptions.disabled_features.push("left_toolbar");
        widgetOptions.disabled_features.push("timeframes_toolbar");
        widgetOptions.disabled_features.push("legend_context_menu");
        widgetOptions.disabled_features.push("shift_visible_range_on_new_bar");
        widgetOptions.disabled_features.push("uppercase_instrument_names");
        widgetOptions.disabled_features.push("main_series_scale_menu");

        idx.add("TVChartpop");
        idx.remove("TVChartContainer");
        cht.add("TVChartpop");
        cht.remove("TVChartContainer");
      } else {
        idx.add("TVChartContainer");
        idx.remove("TVChartpop");
        cht.add("TVChartContainer");
        cht.remove("TVChartpop");
      }
      const uid = sessionStorage.getItem("userid");
      widgetOptions['user_id'] = uid;
      const tvWidget = new widget(widgetOptions);
      this.tvWidget = tvWidget;
      window.tvWidget = tvWidget;

      const self = this;
      tvWidget.onChartReady(() => {
        this.tvReady = true;
        tvWidget.changeTheme(this.$vuetify.theme.dark ? "dark" : "light");
        setTimeout(() => {
          tvWidget.activeChart().applyOverrides({
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
          tvWidget.headerReady().then(() => {
            const refreshButton = tvWidget.createButton({ align: "right" });
            refreshButton.setAttribute("title", "Reset Chart");
            refreshButton.innerHTML =
              '<svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 19C5.5 20.6811 5.99852 22.3245 6.93251 23.7223C7.8665 25.1202 9.19402 26.2096 10.7472 26.853C12.3004 27.4963 14.0094 27.6646 15.6583 27.3367C17.3071 27.0087 18.8217 26.1992 20.0104 25.0104C21.1992 23.8217 22.0087 22.3071 22.3367 20.6583C22.6647 19.0094 22.4963 17.3004 21.853 15.7472C21.2096 14.194 20.1202 12.8665 18.7223 11.9325C17.3245 10.9985 15.6811 10.5 14 10.5H7.5" stroke="currentColor"/><path d="M11 14L7.5 10.5L11 7" stroke="currentColor"/></svg>';

            // const oiprofile = tvWidget.createButton({align: "left"});
            // oiprofile.setAttribute("title", "OI Profile");
            // oiprofile.innerHTML = "OI Profile";
            // oiprofile.addEventListener("click", () => {
            //   self.oiloader = true;
            //   self.getOidatas();
            //   // Render histogram initially
            //   self.tvWidget
            //     .activeChart()
            //     .onVisibleRangeChanged()
            //     .subscribe(null, () => {
            //       self.renderHistogram();
            //     });

            //   self.tvWidget
            //     .activeChart()
            //     .crossHairMoved()
            //     .subscribe(null, () => {
            //       self.renderHistogram();
            //     });
            // });

            refreshButton.addEventListener("click", () => {
              tvWidget.activeChart().resetData();
              tvWidget.activeChart().executeActionById("chartReset");
              self.renderHistogram();
            });
          });
          tvWidget.onContextMenu(function (unixtime, price) {
            return [



              // {text: "-", position: "top"},
              // {text: "-Objects Tree..."},
              {
                position: "top",
                text: "Set Alert " + "(" + price?.toFixed(2) + ")",
                click: function Callback() {
                  // Emit custom event for menu dialog
                  const event = new CustomEvent('menudialog', {
                    detail: {
                      type: 'alert',
                      token: localStorage.getItem("ssdtoken"),
                      exch: localStorage.getItem("ssdtsym")?.split(':')[0],
                      tsym: localStorage.getItem("ssdtsym")?.split(':')[1],
                      action: 'a',
                      data: { price: price?.toFixed(2) }
                    }
                  });
                  window.dispatchEvent(event);
                  // self.altsymbol = tvWidget.activeChart().symbol();
                  // self.alrprice = price?.toFixed(2);
                  // self.altconval = self.altconitem[0];
                  // self.alertval = self.alertitem[0];
                  // self.alertMet();
                },
              },
            ];
          });
        }

        tvWidget.activeChart().dataReady(() => {
          tvWidget.activeChart().executeActionById("chartReset");
        });
        this.showchart = false;
        this.setIndicatorsInterval();
        // Apply any queued symbol change
        if (this.pendingSymbol) {
          try {
            tvWidget.activeChart().setSymbol(this.pendingSymbol);
          } catch (e) { }
          this.pendingSymbol = null;
        }
      });
    },
  },

  destroyed() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  },
};
</script>

<style lang="scss" scoped>
.tradingview-wrapper {
  position: relative !important;
  display: flex !important;
  width: 100% !important;
}

.TVChartContainer {
  overflow: hidden !important;
  height: calc(100vh - 116px) !important;
}

.TVChartpop {
  height: 204px !important;
  zoom: 90% !important;
}

.chart-container {
  width: 100% !important;
}

.histogram-bar {
  height: 5px !important;
  font-size: 8px !important;
  border-radius: 2px !important;
}

.histogram-container {
  right: 200px !important;
  position: relative !important;
  pointer-events: none !important;
}
</style>
