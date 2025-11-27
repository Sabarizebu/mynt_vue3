/* eslint-disable no-extra-boolean-cast */
import { mynturl, myntappurl, params } from '../../apiurl'
import api from '../../apiurl'
import { logMessage } from '../utils/helpers.js'
import { userid, usession, makeApiRequest } from './apiConnectionPool'
import Datafeed from "./feedFactory";
import { useAppStore } from '../../stores/appStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useAuthStore } from '../../stores/authStore'
import moment from 'moment';

let appStore = null;
let sessionStore = null;

// Initialize store when needed
function getAppStore() {
    if (!appStore) {
        appStore = useAppStore();
    }
    return appStore;
}

function getSessionStore() {
    if (!sessionStore) {
        sessionStore = useSessionStore();
    }
    return sessionStore;
}

var connectionStatus = false
const channelToSubscription = new Map();
const singleQuoteMap = new Map();
const guidToSubscription = new Map();
let res = sessionStorage.getItem("c3RhdHVz");

var socketPreResponse = new Map()
var socket = null
var wsreconn = 0;
var heartbeatInterval = null;
var orderStatusInterval = null;
var isConnecting = false;
var isReconnecting = false;

// Advanced WebSocket throttler with per-token batching
class WebSocketBatchDispatcher {
    constructor(batchDelay = 100) {
        this.batchDelay = batchDelay
        this.tokenBatches = new Map() // token -> latest responseFeed
        this.batchTimer = null
    }

    // Add to batch (per-token, keeps latest data only)
    addToBatch(responseFeed) {
        // Use token as key, or message type if no token
        const token = responseFeed.tk || responseFeed.token || responseFeed.t || 'general'

        // Store latest data for this token (overwrites previous)
        this.tokenBatches.set(token, responseFeed)

        // Schedule batch flush if not already scheduled
        if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.flushBatch()
            }, this.batchDelay)
        }
    }

    // Dispatch critical message immediately
    dispatchImmediate(responseFeed) {
        const event = new CustomEvent('web-scoketConn', {
            detail: [responseFeed, 'watchlist']
        })
        window.dispatchEvent(event)
    }

    // Flush all batched updates
    flushBatch() {
        if (this.tokenBatches.size === 0) {
            this.batchTimer = null
            return
        }

        // Dispatch all batched updates (one per token)
        this.tokenBatches.forEach((responseFeed) => {
            const event = new CustomEvent('web-scoketConn', {
                detail: [responseFeed, 'watchlist']
            })
            window.dispatchEvent(event)
        })

        // Clear batch and timer
        this.tokenBatches.clear()
        this.batchTimer = null
    }
}

// Create global throttler instance
const wsThrottler = new WebSocketBatchDispatcher(100)

// Function to get tokenid dynamically using sessionStore
function getTokenId() {
    if (params) {
        return `${myntappurl.clientid}_${myntappurl.source}`
    } else {
        try {
            const sessionStore = getSessionStore()
            const source = sessionStore.mynturl?.source || mynturl.source
            return `${userid}_${source || 'WEB'}`
        } catch (e) {
            return `${userid}_WEB`
        }
    }
}

var userId = params ? myntappurl.clientid : userid
var msession = params ? myntappurl.token : usession
var flow = params;

export var titleIndex = {
    indexLP: "",
    changePer: ""
}

var hb = {
    t: "h",
};

let holdStartTime = null;
var last = {};

// Heartbeat and order status intervals are now created in establishSocketConnection
// This ensures they are properly cleaned up when the socket closes
if (params) {
    establishSocketConnection();
}
// For non-params mode, seyCheckwebsocketInternal() will be called from LayoutSrc.vue after Pinia is ready

function changeScript(symbol, theme) {
    if (!window.tvWidget) return;

    window.tvWidget.activeChart().setSymbol(`${symbol[0].exch}:${symbol[0].tsym}`);

    const url = new URL(window.location.href);
    url.searchParams.set('exch', symbol[0].exch);
    url.searchParams.set('token', symbol[0].token);
    url.searchParams.set('symbol', symbol[0].tsym);
    url.searchParams.set('dark', theme);
    window.tvWidget.changeTheme(theme == 'true' ? "dark" : "light");
    window.history.pushState({}, '', url);

    Datafeed.subscribeQuotesChain(symbol, undefined, undefined);

    if (last && last.exch && last.token) {
        Datafeed.unsubscribeQuotesScreener(`${last.exch}|${last.token}#`);
    }
    last = symbol[0]
}

function seyCheckwebsocketInternal(type) {
    // Get the mynturl from sessionStore (which is reactive and updated)
    const sessionStore = getSessionStore()
    const mynturlStat = sessionStore.mynturl?.stat

    // Update session status and user info
    res = sessionStorage.getItem("c3RhdHVz");

    // Use myntappurl if params is true (src=app), otherwise use sessionStorage
    if (params) {
        userId = myntappurl.clientid
        msession = myntappurl.token
    } else {
        userId = sessionStorage.getItem('userid')
        msession = sessionStorage.getItem('msession')
    }


    if (res == "dmFsaWR1c2Vy" && userId && mynturlStat == 1) {
        establishSocketConnection(type);
    } else {
        // console.log("⚠️ WebSocket conditions not met:", { 
        //     sessionStatus: res, 
        //     userId: !!userId, 
        //     mynturlStat: mynturlStat 
        // })

        // Only retry a limited number of times to avoid infinite loops
        if (!window.wsRetryCount) window.wsRetryCount = 0;
        if (window.wsRetryCount < 50) { // Max 5 seconds of retries
            window.wsRetryCount++;
            setTimeout(function () {
                seyCheckwebsocketInternal(type);
            }, 100)
        } else {
            // console.error("❌ WebSocket connection failed after maximum retries")
            window.wsRetryCount = 0; // Reset for next attempt
        }
        sessionStorage.removeItem('wsstat')
    }
}

// Export this function for external use (e.g., from LayoutSrc.vue)
export function seyCheckwebsocket(type) {
    return seyCheckwebsocketInternal(type);
}

function establishSocketConnection(type) {
    const sessionStore = getSessionStore()
    const wssUrl = params ? myntappurl.wss : sessionStore.mynturl?.wss;

    if (!wssUrl) {
        // console.error('WebSocket URL not found');
        return;
    }

    // Prevent duplicate connections
    if (isConnecting || isReconnecting) {
        // console.log('⚠️ Connection already in progress, skipping...');
        return;
    }

    // Clean up existing socket before creating new one
    if (socket) {
        // console.log('🧹 Cleaning up existing socket before reconnecting...');
        try {
            socket.onclose = null; // Prevent onclose from triggering during manual close
            socket.onerror = null;
            socket.onmessage = null;
            socket.onopen = null;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        } catch (e) {
            // console.error('Error closing existing socket:', e);
        }
        socket = null;
    }

    // Clear existing intervals before creating new ones
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    if (orderStatusInterval) {
        clearInterval(orderStatusInterval);
        orderStatusInterval = null;
    }

    isConnecting = true;
    socket = new WebSocket(wssUrl);

    socket.onopen = function () {
        const tokenid = getTokenId()
        connectionRequest(tokenid, userId)
    }

    socket.onmessage = function (msg) {
        var responseFeed = JSON.parse(msg.data);
        const store = getAppStore();

        if (!!responseFeed.t && responseFeed.t == 'ck' && responseFeed.s == 'OK') {
            console.log("🔌 [WS-STREAM] Received 'ck' with 's=OK' - setting connectionStatus = true")
            connectionStatus = true
            isConnecting = false;
            isReconnecting = false;
            wsreconn = 0; // Reset reconnection counter on successful connection
            // Reset retry counter on successful connection
            window.wsRetryCount = 0;

            // Start heartbeat interval
            if (!heartbeatInterval) {
                heartbeatInterval = window.setInterval(function () {
                    if (res == "dmFsaWR1c2Vy" && userId) {
                        send(JSON.stringify(hb))
                    }
                }, 5000);
            }

            // Start order status check interval (only for non-params mode)
            if (!params && !orderStatusInterval) {
                orderStatusInterval = window.setInterval(function () {
                    if (res == "dmFsaWR1c2Vy" && userId) {
                        send(JSON.stringify({
                            t: "o",
                            actid: userId,
                        }));
                    }
                }, 10000);
            }

            if (params) {
                var url = new URL(window.location.href).searchParams;
                last = { exch: url.get('exch'), token: url.get('token'), tsym: url.get('symbol') };
                Datafeed.subscribeQuotesChain([last], undefined, undefined);
            }
            else {
                console.log("📝 [WS-STREAM] Setting sessionStorage wsstat = 'Ok'")
                sessionStorage.setItem('wsstat', 'Ok');

                // CRITICAL: Notify websocketStore that connection is ready
                // This will flush all pending subscriptions (indices, watchlist, etc.)
                // Use setTimeout to ensure sessionStorage is fully committed
                console.log("⏱️ [WS-STREAM] Scheduling markWebSocketReady() call in 10ms...")
                setTimeout(async () => {
                    try {
                        console.log("🔔 [WS-STREAM] Calling markWebSocketReady() now...")
                        const module = await import('../../stores/websocketStore')
                        const { useWebsocketStore } = module
                        const websocketStore = useWebsocketStore()
                        websocketStore.markWebSocketReady()
                    } catch (err) {
                        console.error('❌ [WS-STREAM] Failed to notify websocketStore:', err)
                    }
                }, 10)

                if (type == 'attempt') {
                    // Trigger order update via store
                    store.addWSOrderAlert('attempt');
                }
            }

        } else if (!!responseFeed.t && responseFeed.t == 'ck' && responseFeed.s == 'NOT_OK') {
            logMessage("!==========[Socket Session Invalid]============!")
            if (!params) {
                sessionStorage.removeItem('wsstat');
                // Use full session error handling to refresh the app
                const authStore = useAuthStore()
                const sessionStore = getSessionStore()
                const sessionError = {
                    emsg: "Session Expired : Invalid Session Key"
                }
                sessionStore.handleSessionError(sessionError, authStore, store)
            }
        }

        if (responseFeed.t) {
            ProcessPacketString(responseFeed)
        }

        // Trigger WebSocket connection event for components
        // Use advanced throttling: Critical messages bypass, quotes/prices are batched
        if (responseFeed.t && responseFeed.t !== 'ck') {
            // Identify critical messages that need immediate dispatch
            const isCriticalMessage =
                responseFeed.t === 'o' ||   // Order updates
                responseFeed.t === 'om' ||  // Order modifications
                responseFeed.t === 'ok'     // Order acknowledgments

            if (isCriticalMessage) {
                // CRITICAL: Dispatch immediately, no throttle/batch
                wsThrottler.dispatchImmediate(responseFeed)
            } else {
                // PRICE/QUOTE DATA: Add to batch (per-token throttling)
                wsThrottler.addToBatch(responseFeed)
            }
        }
    }

    socket.onclose = function (event) {
        console.log("❌ [WS-STREAM] WebSocket onclose fired - setting connectionStatus = false")
        isConnecting = false;
        connectionStatus = false;

        // Clear intervals when socket closes
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
        if (orderStatusInterval) {
            clearInterval(orderStatusInterval);
            orderStatusInterval = null;
        }

        // Reset WebSocket ready state in store
        if (!params) {
            import('../../stores/websocketStore').then(module => {
                const { useWebsocketStore } = module
                const websocketStore = useWebsocketStore()
                websocketStore.resetWebSocketReady()
            }).catch(err => {
                console.error('Failed to reset websocketStore:', err)
            })
        }

        let log = sessionStorage.getItem(userId + new Date().toLocaleDateString());
        var localres = log ? JSON.parse(log) : [];

        // Only attempt reconnection if we haven't exceeded the limit and not already reconnecting
        if (wsreconn < 200 && !isReconnecting) {
            isReconnecting = true;
            setTimeout(() => {
                isReconnecting = false;
                if (params) {
                    establishSocketConnection('attempt')
                } else {
                    seyCheckwebsocketInternal('attempt')
                }
                wsreconn++;
            }, 2600);
            localres.unshift({ time: new Date().toLocaleTimeString("en-US"), msg: `Websocket reconnect attempt ${wsreconn} time.` });
        } else if (wsreconn >= 200) {
            isReconnecting = false;
            sessionStorage.setItem('wsstat', 'Not_ok')
            logMessage(`[socket] onclose:: ${event}`, 1);
            localres.unshift({ time: new Date().toLocaleTimeString("en-US"), msg: `Websocket reconnect attempt failed; it reached the threshold.` });
        }
        sessionStorage.setItem((userId + new Date().toLocaleDateString()), JSON.stringify(localres))
    };

    socket.onerror = function (event) {
        logMessage(`[socket] Error: ${event} type ${event.type}`, 2);
        isConnecting = false;
        // Don't call onclose here - let the browser handle it naturally to avoid duplicate reconnection attempts
    };
}

async function connectionRequest(tokenid, userId) {
    const sessionStore = getSessionStore()
    var initCon = {}
    if (flow) {
        let requestOptions = {
            "uid": `${userId}`,
            "src": "MOB",
            "source": myntappurl.source
        };
        let data = await makeApiRequest(`${api.sessapi}generateSocketSession`, JSON.stringify(requestOptions));
        if ('session' in data) {
            initCon = {
                susertoken: data["session"],
                t: "c",
                actid: `${userId}_MOB`,
                uid: `${userId}_MOB`,
                source: myntappurl.source
            }
        } else {
            var payload = {
                title: 'Alert',
                body: 'Unable to generate Socket Session, Click ok to refresh',
                callback: (res) => {
                    // console.log("clicked", res)
                    location.reload();
                },
            };
            if (window.tvWidget) {
                window.tvWidget.showNoticeDialog(payload);
            }
        }
    } else {
        initCon = {
            susertoken: msession,
            t: "c",
            actid: userId,
            uid: userId,
            source: sessionStore.mynturl?.source || mynturl.source
        }
        setTimeout(() => {
            send(JSON.stringify({
                t: "o",
                actid: userId,
            }));
        }, 3000);
    }
    send(JSON.stringify(initCon));
}

async function send(msg) {
    if (!!socket && !!socket.readyState && socket.readyState == 1) {
        try {
            socket.send(msg);
        } catch (err) {
            // console.error("socket send error : ", err);
        }
    } else if (!!socket && !!socket.readyState && socket.readyState == 0) {
        setTimeout(() => { socket.send(msg); }, 900);
    } else if (!!socket && !!socket.readyState && socket.readyState == 3) {
        // Socket is closed - onclose handler will handle reconnection
        // Don't trigger reconnection here to avoid duplicate attempts
        // console.warn("Socket closed. Reconnection will be handled by onclose event.")
    } else {
        logMessage("[socket send] socket connection is undefined", 2)
    }
}

async function establishConnection(payload) {
    if (connectionStatus == false) {
        const tokenid = getTokenId()
        await connectionRequest(tokenid, userId);
    }
    await send(JSON.stringify(payload));
}

export async function websocketSubscription(payload) {
    if (connectionStatus) {
        var channel = '';
        channel += `${payload}`

        if (channel != '' && !!channel) {
            var tempChannel = channel.substring(0, channel.length - 1)
            var tempUniqueArray = tempChannel.split('#')
            var uniqueChannel = ''
            const uniqueArray = new Set(tempUniqueArray);
            uniqueArray.forEach(element => {
                uniqueChannel += element + '#'
            })
            let json = {
                k: uniqueChannel.substring(0, uniqueChannel.length - 1),
                t: 'd'
            };
            await establishConnection(json);
        }
    } else {
        console.warn('[WS] ❌ websocketSubscription called but connectionStatus=false, subscription dropped:', payload)
    }
}

export async function websocketUnsubscriptionChain(payload) {
    if (connectionStatus) {
        var channel = '';
        channel += `${payload}`

        if (channel != '' && !!channel) {
            var tempChannel = channel.substring(0, channel.length - 1)
            var tempUniqueArray = tempChannel.split('#')
            var uniqueChannel = ''
            const uniqueArray = new Set(tempUniqueArray);
            uniqueArray.forEach(element => {
                uniqueChannel += element + '#'
            })
            let json = {
                k: uniqueChannel.substring(0, uniqueChannel.length - 1),
                t: 'ud'
            };
            await establishConnection(json);
        }
    }
}

export function subscribeOnStream(
    symbols,
    resolution,
    onRealtimeCallback,
    subscribeUID,
    onResetCacheNeededCallback,
    lastDailyBar,
    type) {

    if (type == 'depth') {
        _subscribeDepth(symbols[0], onRealtimeCallback, subscribeUID)
    }
    if (type == 'quotes' || type == 'tt-quotes') {
        _subscribeQuotes(symbols, onRealtimeCallback, subscribeUID, type)

    } else if (type == 'bar') {

        _subscribeBars(symbols, onRealtimeCallback, subscribeUID, lastDailyBar, resolution)
    } else if (type == 'single-quotes') {
        _subscribeSingleQuotes(symbols, onRealtimeCallback, subscribeUID)
    }
}

export function unsubscribeFromStream(listenerGuid) {
    let channelString = guidToSubscription.get(listenerGuid);
    if (!channelString) {
        return;
    }

    let subscriptionItem = channelToSubscription.get(channelString);
    if (subscriptionItem) {
        subscriptionItem.handlers = subscriptionItem.handlers.filter(function (handler) {
            return handler.id != listenerGuid;
        });

        if (subscriptionItem.handlers.length === 0) {
            websocketUnsubscriptionChain(channelString);
            channelToSubscription.delete(channelString);
        }
    }

    guidToSubscription.delete(listenerGuid);
}

function _subscribeQuotes(symbols, onRealtimeCallback, subscribeUID, type) {
    symbols.forEach(function set(symbol) {
        let channelString = `${symbol.exchange}|${symbol.token}#`
        _setChannelMap(symbol, channelString, onRealtimeCallback, subscribeUID, type)
        websocketSubscription(channelString)
    })
}

function _subscribeDepth(symbol, onRealtimeCallback, subscribeUID) {
    var channelString = `${symbol.exchange}|${symbol.token}#`
    _setChannelMap(symbol, channelString, onRealtimeCallback, subscribeUID, 'depth')
    websocketSubscription(channelString)
}

function _subscribeBars(symbols, onRealtimeCallback, subscribeUID, lastDailyBar, resolution) {
    symbols.forEach(function set(symbol) {
        let type = "bar"
        let channelString = `${symbol.exchange}|${symbol.token}#`
        if (symbol.name.includes("$OISYMBOL")) {
            type = "oisymbol"
        }

        _setChannelMap(symbol, channelString, onRealtimeCallback, subscribeUID, type, resolution, lastDailyBar)
        websocketSubscription(channelString)
    })
}

function _subscribeSingleQuotes(symbols, onRealtimeCallback, subscribeUID) {
    symbols.forEach(function set(symbol) {
        let channelString = `${symbol.exchange}|${symbol.token}#`
        let existing = singleQuoteMap.get(subscribeUID)
        if (existing) {
            existing[`${symbol.exchange}|${symbol.token}#`] = {
                quote: {}
            }
        } else {
            singleQuoteMap.set(subscribeUID, new Object())
            singleQuoteMap.get(subscribeUID)[`${symbol.exchange}|${symbol.token}#`] = {
                quote: {},
                symbol: symbol.name
            }
        }
        _setChannelMap(symbol, channelString, onRealtimeCallback, subscribeUID, 'single-quotes')
        websocketSubscription(channelString)
    })
}

function _setChannelMap(symbol, channelString, onRealtimeCallback, subscribeUID, type, resolution, lastDailyBar) {
    let subscriptionItem = channelToSubscription.get(channelString);
    let handler = {
        id: subscribeUID,
        callback: onRealtimeCallback,
    };
    if (subscriptionItem) {
        var index = subscriptionItem.handlers.findIndex(ob => {
            return ob.id == subscribeUID
        })
        if (index == -1) {
            subscriptionItem.handlers.push({
                handler: handler,
                type: type,
                resolution: resolution,
                lastDailyBar: lastDailyBar,
                symbol: symbol.name,
                id: subscribeUID
            });
        } else {
            subscriptionItem.handlers[index] = {
                handler: handler,
                type: type,
                resolution: resolution,
                lastDailyBar: lastDailyBar,
                symbol: symbol.name,
                id: subscribeUID
            }
        }
    } else {
        subscriptionItem = {
            handlers: [{
                handler: handler,
                type: type,
                resolution: resolution,
                lastDailyBar: lastDailyBar,
                symbol: symbol.name,
                id: subscribeUID
            }],
        };
        channelToSubscription.set(channelString, subscriptionItem);
    }
    guidToSubscription.set(subscribeUID, channelString)
    if (!guidToSubscription.has(subscribeUID)) {
        // console.error("guid fail")
    }
}

async function ProcessPacketString(responseFeed) {
    const store = getAppStore();

    try {
        if (responseFeed.t == "am" && responseFeed.dmsg) {
            var msg = responseFeed.dmsg.includes('href=') ? responseFeed.dmsg.replace("href=", "target=_blank href=") : responseFeed.dmsg
            var params = {
                title: 'Alert',
                body: msg,
                callback: msg.includes('Session is inactive') ? true : false,
            };
            store.showAlert(params);
        }
        else if (responseFeed.t == "om") {
            if (responseFeed.status != "PENDING") {
                store.addWSOrderAlert(responseFeed);
            }
            if (holdStartTime) {
                clearTimeout(holdStartTime);
            }
            holdStartTime = setTimeout(async () => {
                if (responseFeed.status != "PENDING") {
                    // Emit custom event for order book updates if needed
                    window.dispatchEvent(new CustomEvent('orderbook-update', { detail: 'orders' }));

                    // Update Order Store
                    try {
                        const { useOrderStore } = await import('../../stores/orderStore');
                        const orderStore = useOrderStore();
                        orderStore.handleOrderUpdate();
                    } catch (e) {
                        // console.error(e)
                    }
                }
                if (responseFeed.status == "COMPLETE") {
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('orderbook-update', { detail: 'port-order' }));
                    }, 1440);
                }
                holdStartTime = null;
            }, 360);
        }
        else if (responseFeed.t === "dk") {
            var depth = {
                snapshot: true,
                asks: [
                    { price: parseFloat(responseFeed["sp1"]) ? parseFloat(responseFeed["sp1"]) : 0, volume: parseInt(responseFeed["sq1"]) ? parseInt(responseFeed["sq1"]) : 0 },
                    { price: parseFloat(responseFeed["sp2"]) ? parseFloat(responseFeed["sp2"]) : 0, volume: parseInt(responseFeed["sq2"]) ? parseInt(responseFeed["sq2"]) : 0 },
                    { price: parseFloat(responseFeed["sp3"]) ? parseFloat(responseFeed["sp3"]) : 0, volume: parseInt(responseFeed["sq3"]) ? parseInt(responseFeed["sq3"]) : 0 },
                    { price: parseFloat(responseFeed["sp4"]) ? parseFloat(responseFeed["sp4"]) : 0, volume: parseInt(responseFeed["sq4"]) ? parseInt(responseFeed["sq4"]) : 0 },
                    { price: parseFloat(responseFeed["sp5"]) ? parseFloat(responseFeed["sp5"]) : 0, volume: parseInt(responseFeed["sq5"]) ? parseInt(responseFeed["sq5"]) : 0 }
                ],
                bids: [
                    { price: parseFloat(responseFeed["bp1"]) ? parseFloat(responseFeed["bp1"]) : 0, volume: parseInt(responseFeed["bq1"]) ? parseInt(responseFeed["bq1"]) : 0 },
                    { price: parseFloat(responseFeed["bp2"]) ? parseFloat(responseFeed["bp2"]) : 0, volume: parseInt(responseFeed["bq2"]) ? parseInt(responseFeed["bq2"]) : 0 },
                    { price: parseFloat(responseFeed["bp3"]) ? parseFloat(responseFeed["bp3"]) : 0, volume: parseInt(responseFeed["bq3"]) ? parseInt(responseFeed["bq3"]) : 0 },
                    { price: parseFloat(responseFeed["bp4"]) ? parseFloat(responseFeed["bp4"]) : 0, volume: parseInt(responseFeed["bq4"]) ? parseInt(responseFeed["bq4"]) : 0 },
                    { price: parseFloat(responseFeed["bp5"]) ? parseFloat(responseFeed["bp5"]) : 0, volume: parseInt(responseFeed["bq5"]) ? parseInt(responseFeed["bq5"]) : 0 }
                ]
            }
            var tradeTime
            let preQuote = {
                ch: parseFloat(responseFeed["lp"]) ? (parseFloat(responseFeed["lp"]) - parseFloat(responseFeed["c"])) : 0,
                chp: parseFloat(responseFeed["pc"]) ? parseFloat(responseFeed["pc"]) : 0,
                lp: responseFeed["lp"] ? parseFloat(responseFeed["lp"]) : 0,
                open_price: responseFeed["o"] ? parseFloat(responseFeed["o"]) : 0,
                high_price: responseFeed["h"] ? parseFloat(responseFeed["h"]) : 0,
                low_price: responseFeed["l"] ? parseFloat(responseFeed["l"]) : 0,
                prev_close_price: responseFeed["c"] ? parseFloat(responseFeed["c"]) : 0,
                volume: 0,
                firstVolume: responseFeed["v"] ? parseInt(responseFeed["v"]) : 0,
                socketVolume: responseFeed['v'] ? parseInt(responseFeed["v"]) : 0,
                token: responseFeed["tk"],
                exchange: responseFeed["e"],
                market_segment_id: responseFeed["e"],
                description: responseFeed["ts"],
                short_name: responseFeed["ts"],
                ap: parseInt(responseFeed["ap"]) ? parseInt(responseFeed["ap"]) : 0,
                ltt: responseFeed["ltt"] ? responseFeed["ltt"] : 0,
                ltq: parseInt(responseFeed["ltq"]) ? parseInt(responseFeed["ltq"]) : 0,
                lc: parseInt(responseFeed["lc"]) ? parseInt(responseFeed["lc"]) : 0,
                uc: parseInt(responseFeed["uc"]) ? parseInt(responseFeed["uc"]) : 0,
                w52h: parseInt(responseFeed["52h"]) ? parseInt(responseFeed["52h"]) : 0,
                w52l: parseInt(responseFeed["52l"]) ? parseInt(responseFeed["52l"]) : 0,
                oi: responseFeed["oi"] ? responseFeed["oi"] : 0,
                toi: responseFeed["toi"] ? responseFeed["toi"] : 0,
                poi: responseFeed["poi"] ? responseFeed["poi"] : 0,
                ask: parseFloat(responseFeed["sp1"]) ? parseFloat(responseFeed["sp1"]) : parseFloat(responseFeed["lp"]),
                ask_qty: parseInt(responseFeed["sq1"]) ? parseInt(responseFeed["sq1"]) : 0,
                bid: parseFloat(responseFeed["bp1"]) ? parseFloat(responseFeed["bp1"]) : parseFloat(responseFeed["lp"]),
                bid_qty: parseInt(responseFeed["bq1"]) ? parseInt(responseFeed["bq1"]) : 0,
                tbq: parseInt(responseFeed["tbq"]) ? parseInt(responseFeed["tbq"]) : 0,
                tsq: parseInt(responseFeed["tsq"]) ? parseInt(responseFeed["tsq"]) : 0,
                depth: depth
            }

            tradeTime = Number(responseFeed["ft"]) * 1000
            if (!socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`)) {
                socketPreResponse.set(`${responseFeed["e"]}|${responseFeed["tk"]}#`, preQuote)
            }

        }
        else if (responseFeed.t === "df") {
            tradeTime = Number(responseFeed["ft"]) * 1000
            if ("lp" in responseFeed && "tk" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp = responseFeed["lp"];
            }
            if ("ap" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).ap = parseFloat(responseFeed["ap"]);
            if ("ltt" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).ltt = responseFeed["ltt"];
            if ("ltq" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).ltq = parseFloat(responseFeed["ltq"]);
            if ("lc" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lc = parseFloat(responseFeed["lc"]);
            if ("uc" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).uc = parseFloat(responseFeed["uc"]);

            if ("52h" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).w52h = parseFloat(responseFeed["52h"]);
            if ("52l" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).w52l = parseFloat(responseFeed["52l"]);
            if ("o" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).open_price = parseFloat(responseFeed["o"]);
            if ("h" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).high_price = parseFloat(responseFeed["h"]);
            if ("l" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).low_price = parseFloat(responseFeed["l"]);
            if ("c" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).prev_close_price = parseFloat(responseFeed["c"]);
            if ("v" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume += parseInt(responseFeed["v"]) - Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).firstVolume);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).socketVolume = parseInt(responseFeed["v"])
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).firstVolume = parseInt(responseFeed['v'])
            }
            if ("pc" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).chp = parseFloat(responseFeed["pc"])

            if ("oi" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi = parseFloat(responseFeed["oi"])
            if ("toi" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).toi = parseFloat(responseFeed["toi"])
            if ("poi" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).poi = parseFloat(responseFeed["poi"])

            socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).ch = (socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp) - (socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).prev_close_price)

            if ("sp1" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[0].price = parseFloat(responseFeed["sp1"]);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).ask = parseFloat(responseFeed["sp1"]);
            }
            if ("sq1" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[0].volume = parseInt(responseFeed["sq1"]);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).ask_qty = parseInt(responseFeed["sq1"]);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).tsq = parseInt(responseFeed["tsq"]);
            }
            if ("tsq" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).tsq = parseInt(responseFeed["tsq"]);
            }
            if ("sp2" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[1].price = parseFloat(responseFeed["sp2"]);
            if ("sq2" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[1].volume = parseInt(responseFeed["sq2"]);
            if ("sp3" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[2].price = parseFloat(responseFeed["sp3"]);
            if ("sq3" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[2].volume = parseInt(responseFeed["sq3"]);
            if ("sp4" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[3].price = parseFloat(responseFeed["sp4"]);
            if ("sq4" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[3].volume = parseInt(responseFeed["sq4"]);
            if ("sp5" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[4].price = parseFloat(responseFeed["sp5"]);
            if ("sq5" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.asks[4].volume = parseInt(responseFeed["sq5"]);

            if ("bp1" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[0].price = parseFloat(responseFeed["bp1"]);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).bid = parseFloat(responseFeed["bp1"]);
            }
            if ("bq1" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[0].volume = parseInt(responseFeed["bq1"]);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).bid_qty = parseInt(responseFeed["bq1"]);
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).tbq = parseInt(responseFeed["tbq"]);
            }
            if ("tbq" in responseFeed) {
                socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).tbq = parseInt(responseFeed["tbq"]);
            }
            if ("bp2" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[1].price = parseFloat(responseFeed["bp2"]);
            if ("bq2" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[1].volume = parseInt(responseFeed["bq2"]);
            if ("bp3" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[2].price = parseFloat(responseFeed["bp3"]);
            if ("bq3" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[2].volume = parseInt(responseFeed["bq3"]);
            if ("bp4" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[3].price = parseFloat(responseFeed["bp4"]);
            if ("bq4" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[3].volume = parseInt(responseFeed["bq4"]);
            if ("bp5" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[4].price = parseFloat(responseFeed["bp5"]);
            if ("bq5" in responseFeed) socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth.bids[4].volume = parseInt(responseFeed["bq5"]);

        }

        let channelString = `${responseFeed["e"]}|${responseFeed["tk"]}#`
        let subscriptionItem = channelToSubscription.get(channelString);

        if (subscriptionItem === undefined) {
            return;
        }
        if (subscriptionItem.handlers === undefined) {
            return;
        }

        const handlers = [...subscriptionItem.handlers];

        // Get the quote data for emission
        const quoteData = socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`);

        // Emit custom event for all quote updates
        if (quoteData && !params) {
            const event = new CustomEvent('websocket-quote-update', {
                detail: quoteData
            });
            window.dispatchEvent(event);
        }

        handlers.forEach(function callHandler(handler) {
            if (handler.type == 'quotes') {
                let quote = {
                    s: 'ok',
                    n: handler.symbol,
                    v: quoteData
                }
                if (!params) {
                    try {
                        handler.handler.callback([quote])
                    } catch (err) {
                        // console.info(err)
                    }
                }

            } else if (handler.type == 'tt-quotes') {
                let quote = {
                    s: 'success',
                    n: handler.symbol,
                    v: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`)
                }
                try {
                    handler.handler.callback(quote)
                } catch (err) {
                    // console.info(err)
                }
            } else if (handler.type == 'bar') {
                const lastDailyBar = handler.lastDailyBar;
                const resolution = handler.resolution;
                let nextDailyBarTime
                if (resolution == '1' || resolution == 1) {
                    nextDailyBarTime = getNextMinBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                } else if (resolution == '1D') {
                    tradeTime = Date.now();
                    nextDailyBarTime = getNextDailyBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                } else if (resolution == '1M') {
                    tradeTime = moment(tradeTime).startOf('month').toDate().getTime() + 19800000
                    nextDailyBarTime = getNextMonthBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                } else if (resolution == "15") {
                    nextDailyBarTime = getfifteenMinBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                }
                let bar;
                if (tradeTime >= nextDailyBarTime) {
                    if (resolution == '1D') {
                        bar = {
                            time: nextDailyBarTime,
                            open: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).open_price),
                            high: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).high_price),
                            low: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).low_price),
                            close: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            volume: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume)
                        };
                    } else {
                        socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume = 0;
                        bar = {
                            time: nextDailyBarTime,
                            open: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            high: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            low: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            close: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            volume: 0,
                        };

                    }
                } else {
                    if (resolution == '1D') {
                        bar = {
                            ...lastDailyBar,
                            high: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).high_price),
                            low: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).low_price),
                            close: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            volume: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume)
                        };
                    } else {
                        bar = {
                            ...lastDailyBar,
                            high: Math.max((lastDailyBar != null ? lastDailyBar.high : 0), socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            low: Math.min(lastDailyBar != null ? lastDailyBar.low : 0, socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp),
                            close: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp) != 0 ? Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).lp) : lastDailyBar.close,
                            volume: Number(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume),
                        };
                    }
                }
                handler.handler.callback(bar)

                const origIndex = subscriptionItem.handlers.findIndex(h => h.id === handler.id);
                if (origIndex !== -1) {
                    subscriptionItem.handlers[origIndex].lastDailyBar = bar;
                }
            }
            else if (handler.type == 'oisymbol') {
                const lastDailyBar = handler.lastDailyBar;
                const resolution = handler.resolution;
                let nextDailyBarTime
                if (resolution == '1' || resolution == 1) {
                    nextDailyBarTime = getNextMinBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                } else if (resolution == '1D') {
                    tradeTime = moment(tradeTime).startOf('day').toDate().getTime() + 19800000
                    nextDailyBarTime = getNextDailyBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                } else if (resolution == '1M') {
                    tradeTime = moment(tradeTime).startOf('month').toDate().getTime() + 19800000
                    nextDailyBarTime = getNextMonthBarTime(lastDailyBar != null ? lastDailyBar.time : null);
                }
                let bar;
                if (tradeTime >= nextDailyBarTime) {
                    if (resolution == '1D') {
                        bar = {
                            time: nextDailyBarTime,
                            open: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).open_price,
                            high: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).high_price,
                            low: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).low_price,
                            close: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                            volume: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume
                        };
                    } else {
                        bar = {
                            time: nextDailyBarTime,
                            open: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                            high: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                            low: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                            close: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                        };
                    }
                } else {
                    if (resolution == '1D') {
                        bar = {
                            ...lastDailyBar,
                            high: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).high_price,
                            low: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).low_price,
                            close: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                            volume: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).volume
                        };
                    } else {
                        bar = {
                            ...lastDailyBar,
                            high: Math.max((lastDailyBar != null ? lastDailyBar.high : 0), socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi),
                            low: Math.min(lastDailyBar != null ? lastDailyBar.low : 0, socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi),
                            close: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).oi,
                        };
                    }
                }
                handler.handler.callback(bar)

                handler.lastDailyBar = bar;
            }
            else if (handler.type == 'single-quotes') {
                let quote = {
                    s: 'success',
                    n: handler.symbol,
                    v: socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`)
                }
                let mapper = singleQuoteMap.get(handler.id)
                if (mapper) {
                    let all = true
                    let callbackResp = []
                    mapper[`${responseFeed["e"]}|${responseFeed["tk"]}#`].quote = quote
                    for (const [, value] of Object.entries(mapper)) {
                        if (Object.keys(value.quote).length === 0) {
                            all = false
                        } else {
                            callbackResp.push({
                                "s": "ok",
                                "n": value.quote.n,
                                "v": {
                                    "ch": value.quote.v.ch,
                                    "chp": value.quote.v.chp,
                                    "short_name": value.quote.n,
                                    "exchange": value.quote.v.exchange,
                                    "description": value.quote.n,
                                    "lp": value.quote.v.lp,
                                    "ask": value.quote.v.ask || 0,
                                    "bid": value.quote.v.bid || 0,
                                    "open_price": value.quote.v.open_price,
                                    "high_price": value.quote.v.high_price,
                                    "low_price": value.quote.v.low_price,
                                    "prev_close_price": value.quote.v.prev_close_price,
                                    "volume": value.quote.v.volume,
                                    "socketVolume": value.quote.v.socketVolume,
                                    "ap": value.quote.v.ap,
                                    "ltt": value.quote.v.ltt,
                                    "ltq": value.quote.v.ltq,
                                    "lc": value.quote.v.lc,
                                    "uc": value.quote.v.uc,
                                    "w52h": value.quote.v['w52h'],
                                    "w52l": value.quote.v['w52l'],
                                }
                            })
                        }
                    }
                    if (all) {
                        handler.handler.callback(callbackResp)
                        singleQuoteMap.delete(handler.handler.id)
                        unsubscribeFromStream(handler.handler.id)
                    }
                }
            } else if (handler.type == 'depth') {
                handler.handler.callback(socketPreResponse.get(`${responseFeed["e"]}|${responseFeed["tk"]}#`).depth)
            }

        });

    } catch (e) {
        // console.error("Error processing packet:", e);
    }
}

function getNextDailyBarTime(barTime) {
    var new_date = moment(barTime).add('1', 'd').startOf('day').toDate()
    return new_date.getTime() + 19800000;
}

function getNextMonthBarTime(barTime) {
    var new_date = moment(barTime).add('1', 'M').startOf('month').toDate()
    return new_date.getTime();
}

function getNextMinBarTime(barTime) {
    const date = new Date(barTime);
    const curTime = moment();
    var duration = moment.duration(curTime.diff(date)).asMinutes();
    if (duration > 1) {
        return curTime.startOf('minute').toDate().getTime()
    } else {
        var new_date = moment(date).add('1', 'm').startOf('minute').toDate()
        return new_date.getTime();
    }
}

function getfifteenMinBarTime(barTime) {
    let date = new Date(barTime);
    let new_date = moment(date).add(15, 'm').toDate();
    return new_date.getTime();
}

window.changeScript = changeScript;

// Global WebSocket manager to maintain active connections
export const WebSocketManager = {
    activeSubscriptions: new Map(),

    registerSubscription(page, token, exch) {
        if (!this.activeSubscriptions.has(page)) {
            this.activeSubscriptions.set(page, []);
        }

        const pageSubscriptions = this.activeSubscriptions.get(page);
        const existingIndex = pageSubscriptions.findIndex(s => s.token === token && s.exch === exch);

        if (existingIndex === -1) {
            pageSubscriptions.push({ token, exch });
        }
    },

    unregisterSubscription(page, token, exch) {
        if (!this.activeSubscriptions.has(page)) {
            return;
        }

        const pageSubscriptions = this.activeSubscriptions.get(page);
        const existingIndex = pageSubscriptions.findIndex(s => s.token === token && s.exch === exch);

        if (existingIndex !== -1) {
            pageSubscriptions.splice(existingIndex, 1);
        }
    },

    isActiveInOtherPages(currentPage, token, exch) {
        for (const [page, subscriptions] of this.activeSubscriptions.entries()) {
            if (page !== currentPage) {
                const exists = subscriptions.some(s => s.token === token && s.exch === exch);
                if (exists) {
                    return true;
                }
            }
        }
        return false;
    }
};
