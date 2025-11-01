/* eslint-disable */
import { makeApiRequest } from './apiConnectionPool.js';
import { subscribeOnStream, unsubscribeFromStream, websocketUnsubscriptionChain } from './webSocketstream.js';
import { logMessage } from '../utils/helpers.js';
import { myntDCUrl, mynturl, params, myntappurl } from "../../apiurl";
import { getcprData } from "./customIndicators.js";
import { getMasters } from "./getAPIdata.js"
var userid = null;
var usession = null;

function seyCheckwebsocket() {
    if (params) {
        userid = myntappurl.clientid
        usession = myntappurl.token
    } else {
        userid = sessionStorage.getItem('userid')
        usession = sessionStorage.getItem('msession')
    }
}
const lastBarsCache = new Map();
window._symbolInfoMap = {}

const supported_resolutions = ['1', '2', '3', '4', '5', '6', '7', '8',
    '9', '10', '11', '12', '13', '14', '15', '16',
    '17', '18', '19', '20', '21', '22', '23', '24',
    '25', '26', '27', '28', '29', '30', '31', '32',
    '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48',
    '49', '50', '51', '52', '53', '54', '55', '56',
    '57', '58', '59', '60', '65', '70', '75', '80', '85', '90', '95',
    '100', '105', '110', '115', '120', '125', '130', '135',
    '140', '145', '150', '155', '160', '165', '170', '175',
    '180', '185', '190', '195', '200', '205', '210', '215',
    '220', '225', '230', '235', '240', '245', '250', '255',
    '260', '265', '270', '275', '280', '285', '290', '295',
    '300', '305', '310', '315', '320', '325', '330', '335',
    '340', '345', '350', '355', '360', '365', '370', '375',
    '380', '385', '390', '395', '400', '405', '410', '415',
    '420', '425', '430', '435', '440', '445', '450', '455',
    '460', '465', '470', '475', '480', '485', '490', '495',
    '500', '505', '510', '515', '520', '525', '530', '535',
    '540', '545', '550', '555', '560', '565', '570', '575', '580', '585', '590',
    '595', '600', '605', '610', '615', '620', '625', '630',
    '635', '640', '645', '650', '655', '660', '665', '670',
    '675', '680', '685', '690', '695', '700', '705', '710',
    '715', '720', '725', '730', '735', '740', '745', '750',
    '755', '760', '765', '770', '775', '780', '785', '790',
    '795', '800', '805', '810', '815', '820', '825', '830',
    '835', '840', '845', '850', '855', '860', '865', '870',
    '875', '880', '885', '890', '895', '900', '905', '910',
    '915', '920', '925', '930', '935', '940', '945', '950',
    '955', '960', '965', '970', '975', '980', '985', '990',
    '995', '1000', '1005', '1010', '1015', '1020', '1025', '1030',
    '1035', '1040', '1045', '1050', '1055', '1060', '1065',
    '1070', '1075', '1080', '1085',
    '1090', '1095', '1100', '1105',
    '1110', '1115', '1120', '1125',
    '1130', '1135', '1140', '1145',
    '1150', '1155', '1160', '1165',
    '1170', '1175', '1180', '1185',
    '1190', '1195', '1200', '1D', '2D', '3D', '4D', '5D', '6D', '1W', '2W', '3W', '4W', '1M', '2M', '3M', '4M', '5M', '6M', '7M', '8M', '9M', '10M', '11M', '12M'
]

const configurationData = {
    supported_resolutions: ["1", "3", "5", "10", "15", "30", "45", "60", "75", "120", "180", "240", "1D", "1W", "1M"],
    exchanges: [
        { "value": "ALL", "name": "All exchange" },
        { "value": "NSE", "name": "NSE" },
        { "value": "BSE", "name": "BSE", },
        { "value": "MCX", "name": "MCX", }
    ],
    symbols_types: [
        { name: "All", value: "" },
        { name: "Equity", value: "STOCK" },
        { name: "F&O", value: "F&O" },
        { name: "Currency", value: "CURR" },
        { name: "Commodity", value: "COMM" },
        { name: "Indices", value: "UNDIND" },
    ],
    "supports_search": true,
    "supports_group_request": false,
    "supports_marks": false,
    "supports_timescale_marks": true,
    "supports_time": true
};

export default {
    async onReady(callback) {
        setTimeout(() => callback(configurationData));
    },
    async searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
        const symbols = await getAllSymbols(userInput, exchange, symbolType);
        onResultReadyCallback(symbols);
    },

    async getQuotes(symbols, onDataCallback, onErrorCallback) {
        var symbolInfos = {}
        symbols.forEach(symbol => {
            function resolvedata(symbolInfo) {
                symbolInfos[symbol] = symbolInfo
                if (Object.keys(symbolInfos).length == symbols.length) {
                    subscribeOnStream(Object.values(symbolInfos),
                        undefined,
                        onDataCallback,
                        Date.now().toString(),
                        undefined,
                        undefined, 'single-quotes')
                }
            }
            this.resolveSymbol(symbol, resolvedata, onErrorCallback)
        });
    },

    async subscribeQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {
        if (fastSymbols == null) {
            fastSymbols = symbols
        }
        var symbolInfos = {}
        symbols.forEach(symbol => {
            function resolvedata(symbolInfo) {
                symbolInfos[symbol] = symbolInfo
                if (Object.keys(symbolInfos).length == symbols.length) {
                    subscribeOnStream(Object.values(symbolInfos),
                        undefined,
                        onRealtimeCallback,
                        listenerGuid,
                        undefined,
                        undefined, 'quotes')
                }
            }
            this.resolveSymbol(symbol, resolvedata, (res) => {
                logMessage(`resolveSymbol error : ${res} `)
            })
        });
    },
    async unsubscribeQuotes(listenerGUID) {
        unsubscribeFromStream(listenerGUID)
    },

    subscribeQuotesChain(tokens, onRealtimeCallback, listenerGuid) {
        var promises = tokens.map((token) => {
            return Promise.resolve({
                name: `${token.exch}:${(token.tsym || '').toUpperCase()}`,
                exchange: token.exch,
                token: token.token
            })

        })
        Promise.all(promises).then((SymbolInfo) => {
            subscribeOnStream(SymbolInfo,
                undefined,
                onRealtimeCallback,
                listenerGuid,
                undefined,
                undefined, 'quotes')
        })

    },
    unsubscribeQuotesChain(symbolList) {
        websocketUnsubscriptionChain(symbolList)
    },
    subscribeQuotesScreener(tokens, onRealtimeCallback, listenerGuid) {
        var promises = tokens.map((token) => {
            return Promise.resolve({
                name: `${token.exch}:${(token.tsym || '').toUpperCase()}`,
                exchange: token.exch,
                token: token.token
            })

        })
        Promise.all(promises).then((SymbolInfo) => {
            subscribeOnStream(SymbolInfo,
                undefined,
                onRealtimeCallback,
                listenerGuid,
                undefined,
                undefined, 'quotes')
        })

    },
    unsubscribeQuotesScreener(symbolList) {
        websocketUnsubscriptionChain(symbolList)
    },
    async resolveSymbol(symbolName, onSymbolResolvedCallback, ErrorCallback) {
        let oisymbol = false
        if (_symbolInfoMap[symbolName] != undefined) {
            setTimeout(() => onSymbolResolvedCallback(_symbolInfoMap[symbolName]));
            return Promise.resolve(_symbolInfoMap[symbolName])
        }
        var symbolItem;
        if (symbolName.includes("$OISYMBOL")) {
            symbolName = symbolName.replace("$OISYMBOL", "")
            oisymbol = true
        }
        let symbols = await getMasters(`${symbolName.toUpperCase()}`);
        symbolItem = symbols
        if (symbolItem == undefined || symbolItem && symbolItem.length == 0) {
            ErrorCallback('Cannot resolve symbol');
            return;
        }
        if (oisymbol) {
            symbolName = symbolName + "$OISYMBOL"
        }

        // var ex = symbolName.split(":")[0];
        // var typ;
        // if (ex == "NSE" || ex == "BSE") {
        //     typ = "stock"
        // }
        // else if (ex == "NFO") {
        //     typ = "index"
        // }

        const symbolInfo = {
            token: symbolItem[0],
            ticker: symbolName,
            name: symbolName,
            base_name: symbolItem[4] == "IDX" ? symbolItem[1] : symbolName.split(":")[1],
            pro_name: symbolName,
            full_name: symbolName,
            description: symbolName,
            tick_size: String(symbolItem[2]),
            type: symbolName.includes("FUT") ? "futures" : symbolItem[4] == "IDX" ? "index" : symbolName.includes("NSE" || "BSE") ? "stock" : "undefined",
            session: symbolName.split(":")[0] == "MCX" ? "0900-2330" : symbolName.split(":")[0] == "CDS" ? "0900-1700" : "0915-1530",
            timezone: "Asia/Kolkata",
            exchange: symbolName.split(":")[0],
            minmov: symbolName.split(":")[0] == "CDS" ? symbolItem[2] * 10000 : symbolItem[2] * 100,
            pricescale: symbolName.split(":")[0] == "CDS" ? 10000 : 100,
            has_intraday: true,
            has_daily: true,
            visible_plots_set: symbolItem[4] == "IDX" ? "ohlc" : "ohlcv",
            has_weekly_and_monthly: false,
            lot_size: String(symbolItem[3]),
            isTradable: symbolItem[4] != "IDX" ? true : false,
            qty: {
                step: String(symbolName.split(":")[0] == "MCX" ? 1 : symbolItem[3]),
                default: String(symbolName.split(":")[0] == "MCX" ? 1 : symbolItem[3]),
            },
            supported_resolutions: supported_resolutions,
            volume_precision: 1,
            data_status: 'streaming',
            intraday_multipliers: ["1"],
            daily_multipliers: ["1"],
            weekly_multipliers: ["1"],
            monthly_multipliers: ["1"],
            supports_timescale_marks: true,
            session_holidays: getHolidays(symbolName.split(":")[0])
        };
        _symbolInfoMap[symbolName] = symbolInfo
        setTimeout(() => onSymbolResolvedCallback(symbolInfo));
        return Promise.resolve(_symbolInfoMap[symbolName])
    },
    subscribeDepth(symbolInfo, callback) {
        this.resolveSymbol(symbolInfo, (response) => {
            subscribeOnStream([response],
                undefined,
                callback,
                "DOM" + Date.now().toString(),
                undefined,
                undefined, 'depth')
        }, (res) => {
            logMessage(`resolveSymbol error : ${res} `)
        })
    },
    unsubscribeDepth(subscriberUID) {
        unsubscribeFromStream(subscriberUID)
    },
    async getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
        seyCheckwebsocket();
        let oisymbol = false
        if (symbolInfo.name.includes("$OISYMBOL")) {
            oisymbol = true
        }
        let requestOptions
        var data11
        // let consym = "";
        if (resolution == "1D" || resolution == "1W" || resolution == "1M") {
            let symName;
            if (symbolInfo.type == 'index') {
                symName = symbolInfo.exchange + ":" + symbolInfo.base_name
            }
            else {
                symName = symbolInfo.name;
            }
            symName = symName.includes("$OISYMBOL") ? symName.replace("$OISYMBOL", "") : symName;
            symName = symName.includes(" ") ? symName.replace(" ", "%20") : symName;
            symName = symName.includes("&") ? symName.replace("&", "%26") : symName;
            requestOptions = JSON.stringify({ "sym": symName, "from": periodParams.from, "to": periodParams.to })
            try {
                data11 = await makeApiRequest(`${myntDCUrl}getdata`, requestOptions);
                if (data11 && data11.length > 0) {
                    data11 = data11.map(item => {
                        let parsed = JSON.parse(item);
                        parsed.into = parsed.into == "0.00" ? parsed.intc : parsed.into;
                        parsed.intl = parsed.intl == "0.00" ? parsed.intc : parsed.intl;
                        parsed.inth = parsed.inth == "0.00" ? parsed.intc : parsed.inth;
                        return parsed;
                    });
                    // data11=JSON.parse(data11)
                } else {
                    onHistoryCallback([], { noData: true });
                    return;
                }
            } catch (error) {
                console.error('Fetch failed:', error);
                onHistoryCallback([], { noData: true });
                return;
            }

        } else {

            let symName;
            symName = symbolInfo['base_name'].includes("$OISYMBOL") ? symbolInfo['base_name'].replace("$OISYMBOL", "") : symbolInfo['base_name'];
            symName = symName.includes("&") ? symName.replace("&", "%26") : symName;
            requestOptions = `jData={"uid":"${userid}","exch":"${symbolInfo['exchange']}","token":"${symName}","st":"${periodParams.from - 320000}","et":"${periodParams.to}","intrv":"${resolution}"}&jKey=${usession}`;
            // Check if API URL is ready before making request
            const apiUrl = params ? myntappurl.myntapi : mynturl.myntapi;
            if (!apiUrl) {
                console.warn("⚠️ API URL not ready for TPSeries, returning no data");
                onHistoryCallback([], { noData: true });
                return;
            }
            data11 = await makeApiRequest(`${apiUrl}TPSeries`, requestOptions);
        }
        try {
            if (data11.stat == 'Not_Ok' || data11 == []) {
                onHistoryCallback([], { noData: true });
                return;
            }
            let data = data11.map(d => {
                return { time: parseFloat(d.ssboe), open: parseFloat(d.into), high: parseFloat(d.inth), low: parseFloat(d.intl), close: parseFloat(d.intc), volume: parseFloat(d.intv), oi: parseFloat(d.oi) }
            });
            data = data.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
            var bars = [];
            if (oisymbol) {
                data.forEach(bar => {
                    bars = [...bars, {
                        time: bar.time * 1000,
                        low: bar.low,
                        high: bar.high,
                        open: bar.open,
                        volume: bar.volume,
                        close: bar.oi,
                        oi: bar.oi
                    }];
                });
            } else {
                data.forEach(bar => {
                    bars = [...bars, {
                        time: bar.time * 1000,
                        low: bar.low,
                        high: bar.high,
                        open: bar.open,
                        volume: bar.volume,
                        close: bar.close,
                        oi: bar.oi
                    }];
                });
            }


            if (periodParams.firstDataRequest) {
                lastBarsCache.set(symbolInfo.name, {
                    ...bars[bars.length - 1],
                });
            }
            // await getcprData(symbolInfo, periodParams, usession);
            onHistoryCallback(bars, { noData: false });
        } catch (error) {
            onErrorCallback(error);
        }
    },

    subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
        // Generate a unique ID by combining the subscriberUID with a random component
        const uniqueSubscriberUID = subscriberUID + '_' + Math.random().toString(36).substring(2, 10);
        
        subscribeOnStream(
            [symbolInfo],
            resolution,
            onRealtimeCallback,
            uniqueSubscriberUID,
            onResetCacheNeededCallback,
            lastBarsCache.get(symbolInfo.name), 'bar'
        );
        
        // Store the mapping between the original subscriberUID and uniqueSubscriberUID
        // to be used in unsubscribeBars
        if (!this._subscriberMapping) {
            this._subscriberMapping = new Map();
        }
        this._subscriberMapping.set(subscriberUID, uniqueSubscriberUID);
    },
    unsubscribeBars(subscriberUID) {
        // Get the unique subscriber ID that was generated in subscribeBars
        const uniqueSubscriberUID = this._subscriberMapping ? 
            this._subscriberMapping.get(subscriberUID) : subscriberUID;
            
        unsubscribeFromStream(uniqueSubscriberUID || subscriberUID);
        
        // Clean up the mapping
        if (this._subscriberMapping) {
            this._subscriberMapping.delete(subscriberUID);
        }
    },

    subscribeTtQuotes(symbols, fastSymbols, onRealtimeCallback, listenerGuid) {

        if (fastSymbols == null) {
            fastSymbols = symbols
        }

        let allSym = [...new Set(fastSymbols.concat(symbols))]
        var symbolInfos = {}
        allSym.forEach(symbol => {
            this.resolveSymbol(symbol.symbol != undefined ? symbol.symbol : symbol, (symbolInfo) => {
                symbolInfos[symbol] = symbolInfo
                if (Object.keys(symbolInfos).length == allSym.length) {
                    subscribeOnStream(Object.values(symbolInfos),
                        undefined,
                        onRealtimeCallback,
                        listenerGuid,
                        undefined,
                        undefined, 'tt-quotes')
                }
            }, (res) => {
                logMessage(`resolveSymbol error : ${res} `)
            })
        });
    },
}

async function getAllSymbols(searchInput, exchange, symbolType) {
    seyCheckwebsocket();
    var exch = ""
    var filterList = []
    if (searchInput.includes(":")) {
        searchInput = searchInput.split(":")[1];
    }
    switch (exchange) {
        case "NSE":
            switch (symbolType) {
                case "STOCK":
                    exch = "NSE"
                    filterList = ["NSE"]
                    break;
                case "F&O":
                    exch = "NFO"
                    filterList = ["NFO"]
                    break;
                case "CURR":
                    exch = "CDS"
                    filterList = ["CDS"]
                    break;
                case "COMM":
                    exch = "NCOM"
                    filterList = ["NCOM"]
                    break;
                case "UNDIND":
                    exch = "UNDIND"
                    filterList = ["NSE"]
                    break;
                default:
                    exch = ""
                    filterList = ["NSE", "NFO", "CDS", "NCOM"]
                    break;
            }
            break;

        case "BSE":
            switch (symbolType) {
                case "STOCK":
                    exch = "BSE"
                    filterList = ["BSE"]
                    break;
                case "F&O":
                    exch = "BFO"
                    filterList = ["BFO"]
                    break;
                case "CURR":
                    exch = "BCD"
                    filterList = ["BCD"]
                    break;
                case "COMM":
                    exch = "BCOM"
                    filterList = ["BCOM"]
                    break;
                case "UNDIND":
                    exch = "UNDIND"
                    filterList = ["BSE"]
                    break;
                default:
                    exch = ""
                    filterList = ["BSE", "BFO", "BCD", "BCOM"]
                    break;
            }
            break;

        case "MCX":
            switch (symbolType) {
                case "STOCK":
                    filterList = []
                    break;
                case "F&O":
                    filterList = []
                    break;
                case "CURR":
                    filterList = []
                    break;
                case "COMM":
                    filterList = ["MCX"]
                    break;
                case "UNDIND":
                    exch = "UNDIND"
                    filterList = ["MCX"]
                    break;
                default:
                    exch = ""
                    filterList = ["MCX"]
                    break;

            }
            exch = "MCX"
            break;

        case "ALL":
            switch (symbolType) {
                case "STOCK":
                    filterList = ["NSE", "BSE"]
                    break;
                case "F&O":
                    filterList = ["NFO", "BFO"]
                    break;
                case "CURR":
                    filterList = ["CDS", "BCD"]
                    break;
                case "COMM":
                    filterList = ["NCOM", "BCOM", "MCX"]
                    break;
                case "UNDIND":
                    exch = "UNDIND"
                    filterList = []
                    break;
                default:
                    filterList = ["NSE", "NFO", "CDS", "NCOM", "BSE", "BFO", "BCD", "BCOM", "MCX"]
                    break;
            }
            exch = ""
            break;

        default:
            exch = ""
            break;
    }

    if (symbolType != "UNDIND") {
        if (searchInput.includes("&")) {
            searchInput = searchInput.replace("&", "%26")
        }
        if (searchInput.includes(" ")) {
            searchInput = searchInput.replace(" ", "_")
        }
        var request = `jData={"uid":"${userid}","stext":"${searchInput}"}&jKey=${usession}`;
        if (exch && symbolType != "UNDIND") {
            request = `jData={"uid":"${userid}","stext":"${searchInput}","exch":"${exch}"}&jKey=${usession}`;
        }
        // Check if mynturl is ready before making API call
        if (!mynturl.myntapi) {
            console.warn("⚠️ mynturl.myntapi not ready for SearchScrip, returning empty results");
            return [];
        }
        const allSymbols = await makeApiRequest(mynturl.myntapi + "SearchScrip", request);
        if (allSymbols.stat == "Not_Ok") {
            return []
        }
        let searchSymbols = allSymbols.values.map(value => {
            let scriptDescription = ""
            let symboltype = value.instname == "OPTIDX" ? "Option" : value.instname == "FUTIDX" ? "Future" : value.instname == "OPTSTK" ? "Option" : value.instname == "FUTSTK" ? "Future" : value.instname == "COM" ? "Commodity" : value.instname == "FUTCUR" ? "Future" : value.instname == "OPTCUR" ? "Option" : value.instname == "UNDIND" ? "Index" : value.instname == "FUTCOM" ? "Future" : value.instname == "OPTFUT" ? "Option" : "Stock";
            if (value.instname == "OPTIDX" || value.instname == "OPTSTK" || value.instname == "OPTCUR" || value.instname == "OPTFUT") {
                let matchval = value.tsym.match(/(\d{1,2})[a-zA-Z]{3}(\d{2,4})?/g)
                if (matchval) {
                    let scriptList = value.tsym.split(matchval[0])
                    scriptDescription = `${scriptList[0]}  ${matchval[0].replace(/(..)(...)(..)/, "$1-$2-$3")}  ${scriptList[1].substring(0, 1)}E  ${scriptList[1].substring(1)}  ${value.hasOwnProperty('weekly') ? `(week ${value.weekly.substring(1)})` : ""}`;
                }
            }
            if (value.instname == "FUTIDX" || value.instname == "FUTSTK" || value.instname == "FUTCUR" || value.instname == "FUTCOM") {
                let matchval = value.tsym.match(/(\d{1,2})[a-zA-Z]{3}(\d{2,4})?/g)
                if (matchval) {
                    let scriptList = value.tsym.split(matchval[0])
                    scriptDescription = `${scriptList[0]}  ${matchval[0].replace(/(..)(...)(..)/, "$1-$2-$3")}  ${scriptList[1].substring(0, 1) == "F" ? "FUT" : "FUT"}  ${scriptList[1].substring(1)}`;
                }
            }
            return {
                exchanges: value.exch,
                symbols_types: symboltype,
                symbol: value.exch + ":" + value.tsym.toUpperCase(),
                full_name: value.cname,
                description: scriptDescription ? scriptDescription : value.cname,
                exchange: value.exch,
                ticker: value.exch + ":" + value.tsym.toUpperCase(),
                type: symboltype,
            };
        }).filter((result) => {
            if (filterList.length > 0) return filterList.includes(result.exchanges) & (result.symbols_types != "Commodity")
            else return result
        })
        return searchSymbols
    } else {
        return []
    }
    // else {
    //     let filtered = masterSIndexJson.filter((value) => value.includes(`${searchInput.toUpperCase()}`)).filter((value) => {
    //         if (filterList.length > 0) return filterList.includes(value.split(":")[0])
    //         else return value
    //     });
    //     let searchResult = filtered.map(async (values) => {
    //         let value = await getMasters(values)
    //         return {
    //             exchanges: values.split(":")[0],
    //             symbols_types: "Index",
    //             symbol: values,
    //             full_name: value[1],
    //             description: value[1],
    //             exchange: values.split(":")[0],
    //             ticker: values,
    //             type: "Index",
    //         };
    //     })
    //     return searchResult
    // }

}

function getHolidays(exchange) {
    if (exchange == "NSE") {
        return "20240122,20240126,20240308,20240325,20240329,20240411,20240417,20240501,20240617,20240717,20240815,20241002,20241115,20241225"
    }
    else if (exchange == "BSE") {
        return "20240126,20240308,20240325,20240329,20240411,20240417,20240501,20240617,20240717,20240815,20241002,20241115,20241225"
    }
    else if (exchange == "MCX") {
        return "20240126,20240329,20240815,20241002,20241225"
    }
    else if (exchange == "NFO") {
        return "20240122,20240126,20240308,20240325,20240329,20240411,20240417,20240501,20240617,20240717,20240815,20241002,20241115,20241225"
    }
    else if (exchange == "CDS") {
        return "20240122,20240126,20240219,20240308,20240325,20240329,20240401,20240409,20240411,20240417,20240501,20240523,20240617,20240717,20240815,20240916,20241002,20241115,20241225"
    }
    else if (exchange == "NCOM") {
        return "20240122,20240126,20240329,20240815,20241002,20241225"
    }
    else if (exchange == "BCD") {
        return "20240126,20240219,20240308,20240325,20240329,20240401,20240409,20240411,20240417,20240501,20240523,20240617,20240717,20240815,20240916,20241002,20241115,20241225"
    }
    else if (exchange == "BFO") {
        return "20240126,20240308,20240325,20240329,20240411,20240417,20240501,20240617,20240717,20240815,20241002,20241115,20241225"
    }
    else {
        return ""
    }

}
