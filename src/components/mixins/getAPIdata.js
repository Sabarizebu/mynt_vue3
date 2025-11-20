// /* eslint-disable */
import apiurl from '../../apiurl'
import { mynturl } from "../../apiurl";
import fire from '../../firebase';
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'
import { useSessionStore } from '../../stores/sessionStore'
import CryptoJS from 'crypto-js'

let firebase = null
var uid = apiurl.uid
var tok = apiurl.tok
var source = null;

var positiondata = {};
var holdingsdata = {};
var ordersdata = {};
var clientdetails = {};
var orderprefdata = {};

var sllmasters = {};
setIndicatorsidx();

// Request deduplication: Track pending requests to prevent duplicate calls
const pendingRequests = new Map();

// Get app store for notifications
function getAppStore() {
    return useAppStore();
}

// Global state for Limits API - STRICT "CALL ONLY ONCE" mechanism
let limitsApiState = {
    hasBeenCalledOnce: false,  // Flag to ensure API is called only once
    isPending: false,
    pendingPromise: null,
    cachedData: null,          // Cache the response permanently until manual refresh
    cacheExpiry: 0,
    cacheDurationMs: Infinity  // Cache forever until manual refresh
};

export async function seyCheckwebsocket() {
    uid = sessionStorage.getItem('userid');
    tok = sessionStorage.getItem('msession');
}

function setIndicatorsidx() {
    var url = new URL(window.location.href).searchParams;
    if (url && url.get("user")) {
        uid = url.get("user");
        tok = url.get("usession");
    }
}

let myHeaders = new Headers();
let myHeader = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeader.append("Content-Type", "text/plain");

var requestOptions = {
    method: 'POST',
    redirect: 'follow',
    headers: myHeaders
};
var requestMOption = {
    method: 'POST',
    redirect: 'follow',
    headers: myHeader
};

function setHeaderauth() {
    let uid = sessionStorage.getItem('userid');
    let tok = sessionStorage.getItem('usession');

    // Only set headers if we have valid values (not null)
    if (uid && !myHeaders.has("clientid")) {
        myHeaders.set("clientid", uid);
    } else if (!uid && myHeaders.has("clientid")) {
        // Remove clientid if uid is null
        myHeaders.delete("clientid");
    }

    if (tok && !myHeaders.has("Authorization")) {
        myHeaders.set("Authorization", tok);
    } else if (!tok && myHeaders.has("Authorization")) {
        // Remove Authorization if tok is null
        myHeaders.delete("Authorization");
    }
}

// Helper function to create clean request options without auth headers for public APIs
function createPublicRequestOptions() {
    const publicHeaders = new Headers();
    publicHeaders.append("Content-Type", "application/json");
    return {
        method: 'POST',
        redirect: 'follow',
        headers: publicHeaders
    };
}

// Helper function to add timeout to fetch requests with proper cancellation
// Reduced timeout to 5 seconds for faster failure detection on Firebase
function fetchWithTimeout(url, options = {}, timeout = 5000) {
    // Create AbortController to actually cancel the request
    const controller = new AbortController();
    let timeoutId;

    // Create a promise that rejects on timeout
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error('Request timeout'));
        }, timeout);
    });

    // If there's an existing signal, listen to it and abort our controller if it's aborted
    if (options.signal) {
        if (options.signal.aborted) {
            clearTimeout(timeoutId);
            controller.abort();
            return Promise.reject(new Error('Request already aborted'));
        } else {
            options.signal.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                controller.abort();
            });
        }
    }

    // Merge abort signal with existing options
    const fetchOptions = {
        ...options,
        signal: controller.signal,
        // Add mode and credentials to handle CORS properly
        mode: 'cors',
        credentials: 'omit'
    };

    // Race between fetch and timeout
    return Promise.race([
        fetch(url, fetchOptions)
            .then(response => {
                clearTimeout(timeoutId);
                return response;
            })
            .catch(error => {
                clearTimeout(timeoutId);
                // Handle network errors (CORS, connection refused, etc.)
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    throw new Error('Network error: Failed to fetch - possible CORS or connection issue');
                }
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }),
        timeoutPromise
    ]);
}

export async function GetAllSearchData(item, cat) {
    if (cat) {
        requestOptions['body'] = `{"text":"${item}" , "category":"${cat.toUpperCase()}"}`;
    } else {
        requestOptions['body'] = `{"text":"${item}"}`;
    }
    // Use production API endpoint instead of localhost
    var response = await FetchsearchData(apiurl.searchapi + "search", requestOptions);
    return response
}

export async function getToken() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI('https://sess.mynt.in/getoken', requestOptions)
    return response
}

// Auth
export async function getKambalaAuth(item) {
    requestOptions['body'] = `{"LoginId":"${item[0]}", "token":"${item[1]}"}`
    var response = await fetchMyntAPI(apiurl.autho + "kambala_auth", requestOptions)
    return response
}

export async function getDeskLogout(item) {
    requestOptions['body'] = `{"clientid":"${item[0]}", "token":"${item[1]}"}`
    var response = await fetchMyntAPI(apiurl.autho + "desklogout", requestOptions)
    return response
}

export async function getReSession(item) {
    const c = crypto.randomUUID();
    requestOptions['body'] = `{"imei": "${c}","clientid": "${item[0]}","hstoken": "${item[1]}","source": "TV","path": "${item[2]}"}`
    var response = await fetchMyntAPI(apiurl.copy + "redirect", requestOptions)
    if (response && response.stat == "Ok") { response['timei'] = c; }
    return response
}

export async function getProfiledata(item) {
    requestOptions['body'] = item[0];
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.ledger + "profile", requestOptions);
    return response
}

export async function getValidSession(item) {
    requestOptions['body'] = `{"clientid":"${item}", "mobile_unique": "web"}`
    var response = await fetchMyntAPI(apiurl.copy + "validate_session", requestOptions)
    return response
}

export async function getcallApi(item) {
    requestOptions['body'] = item
    var response = await fetchMyntAPI(apiurl.copy + "MobileLogin", requestOptions)
    return response
}

export async function getActiveSession(item) {
    if (firebase && firebase.source) {
        source = firebase.source;
    } else {
        await fire.get(fire.child(fire.ref(fire.db), `desk/`)).then((snapshot) => {
            if (snapshot.exists()) {
                firebase = snapshot.val()
                source = firebase.source;
            } else {
                firebase = 'WEB'
                source = "WEB"
            }
        }).catch((error) => {
            source = "WEB"
            // console.error(error);
        });
        var soc = new URL(window.location.href).searchParams.get("src");
        var mainsoc = soc ? soc : sessionStorage.getItem(`socsrc`);
        if (mainsoc) {
            source = mainsoc;
            firebase.source = mainsoc;
            sessionStorage.setItem(`socsrc`, source);
        }
    }

    var payid = seteEcryption(item)
    requestOptions['body'] = `{"string":"${payid}","source":"${source}"}`
    var response = await fetchMyntAPI(apiurl.copy + "get_sessions", requestOptions)
    var out = JSON.parse(setDecryption(response.str))
    return out
}

export async function getPreDefinedMW() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.copy + "PreDefinedMW", requestOptions)
    return response
}

export async function getLoggedIn() {
    requestMOption['body'] = `jData={"uid":"${uid}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "ShowLoggedInSessions", requestMOption)
    return response
}

export async function getHsTokenapi() {
    requestMOption['body'] = `jData={"uid":"${uid}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetHsToken", requestMOption)
    return response
}

export async function getGloabSearch(data) {
    requestMOption['body'] = data
    var response = await fetchMyntAPI(apiurl.zebuApiUrl + 'global/SearchScrip', requestMOption)
    return response
}

export async function getKambalaSearch(data) {
    requestMOption['body'] = data
    var response = await fetchMyntAPI(mynturl.myntapi + 'SearchScrip', requestMOption)
    return response
}

export async function getMwatchlistset(data, url) {
    requestMOption['body'] = data
    var response = await fetchMyntAPI(mynturl.myntapi + url, requestMOption)
    return response
}

export async function getMHoldings(flowis) {
    const store = getAppStore();

    // Get credentials from sessionStorage
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');

    if (!currentUid || !currentTok) {
        return { response: [], edis: 0 };
    }

    if (flowis && holdingsdata && holdingsdata.response && holdingsdata.response.length > 0) {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('tempdata-update', { detail: holdingsdata }));
        }, 10);
    }
    requestMOption['body'] = `jData={"uid":"${currentUid}","actid":"${currentUid}","prd":"C"}&jKey=${currentTok}`
    var data = await fetchMyntAPI(mynturl.myntapi + "Holdings", requestMOption)

    let holdlist = [];
    var sum = 0;
    if (data && data.length > 0) {
        for (let q = 0; q < data.length; q++) {
            data[q]["idx"] = q;
            data[q]["exch"] = data[q].exch_tsym[0].exch;
            data[q]["exchs"] = data[q].exch_tsym[0].tsym.includes("-TB") ? "T-BILL" : data[q].exch_tsym[0].tsym.includes("-GS") ? "G-SEC" : data[q].exch_tsym[0].tsym.includes("-GB") ? "SGB" : data[q].exch_tsym[0].exch;
            data[q]["token"] = data[q].exch_tsym[0].token;
            data[q]["tsym"] = data[q].exch_tsym[0].tsym;
            data[q]["pp"] = data[q].exch_tsym[0].pp;
            data[q]["ti"] = data[q].exch_tsym[0].ti;
            data[q]["ls"] = data[q].exch_tsym[0].ls;
            data[q]["isin"] = data[q].exch_tsym[0].isin;

            const hold = Number(data[q].holdqty) > 0 ? Number(data[q].holdqty) : 0;
            const unplgd = Number(data[q].unplgdqty) > 0 ? Number(data[q].unplgdqty) : 0;
            const ben = Number(data[q].benqty) > 0 ? Number(data[q].benqty) : 0;
            const maxOther = Math.max(
                Number(data[q].npoadt1qty) > 0 ? Number(data[q].npoadt1qty) : 0,
                Number(data[q].npoadqty) > 0 ? Number(data[q].npoadqty) : 0,
                Number(data[q].dpqty) > 0 ? Number(data[q].dpqty) : 0
            );
            const used = Number(data[q].usedqty) > 0 ? Number(data[q].usedqty) : 0;
            data[q]["netqty"] = (hold + unplgd + ben) + maxOther - used;
            data[q]["salqty"] = data[q].btstqty > 0 ? data[q].btstqty : 0 + data[q].holdqty > 0 ? data[q].holdqty : 0 + data[q].unplgdqty > 0 ? data[q].unplgdqty : 0 + data[q].benqty > 0 ? data[q].benqty : 0 + data[q].dpqty > 0 ? data[q].dpqty : 0 - data[q].usedqty > 0 ? data[q].usedqty : 0;
            data[q]["plgqty"] = data[q].brkcolqty > 0 ? data[q].brkcolqty : 0;
            data[q]["action"] = data[q].exch == "NSE" || data[q].exch == "BSE" || data[q].exch == "NFO" || data[q].exch == "MCX" || data[q].exch == "CD" ? true : false;
            holdlist.push({ ...data[q] });

            sum += Number(data[q]?.npoadqty) > 0 ? Number(data[q].npoadqty) : 0;
            sum += Number(data[q]?.npoadt1qty) > 0 ? Number(data[q].npoadt1qty) : 0;
        }
    }
    if (data != 500) {
        holdingsdata = { response: holdlist, edis: sum };
        // Always dispatch event after storing new data (with delay to ensure listeners are ready)
        if (flowis && holdingsdata && holdingsdata.response) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('tempdata-update', { detail: holdingsdata }));
            }, 150);
        }
    }
    return holdingsdata
}

export async function getMMHoldings() {
    let datas = {
        "ClientCode": uid
    }
    requestOptions['body'] = JSON.stringify(datas);
    var datamf = await fetchMyntAPI(apiurl.mfnewapi + "order/holdings", requestOptions)

    return datamf
}

export async function getMPosotion(flowis) {
    const store = getAppStore();

    // Get credentials from sessionStorage
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');

    if (!currentUid || !currentTok) {
        return { a: [], o: [], c: [] };
    }

    if (flowis && positiondata && positiondata.data && positiondata.data.length > 0) {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('tempdata-update', { detail: positiondata }));
        }, 10);
    }
    requestMOption['body'] = `jData={"uid":"${currentUid}","actid":"${currentUid}"}&jKey=${currentTok}`

    var data = await fetchMyntAPI(mynturl.myntapi + "PositionBook", requestMOption)

    var closeposition = [];
    var openposition = [];
    if (data && data.length > 0) {
        for (let q = 0; q < data.length; q++) {
            data[q]["idx"] = q;
            const bAvg = data[q].exch == "CDS" || data[q].exch == "BCD" ? parseFloat(data[q].totbuyavgprc).toFixed(4) : parseFloat(data[q].totbuyavgprc).toFixed(2);
            const sAvg = data[q].exch == "CDS" || data[q].exch == "BCD" ? parseFloat(data[q].totsellavgprc).toFixed(4) : parseFloat(data[q].totsellavgprc).toFixed(2);
            const bavg = !bAvg ? 0 : bAvg;
            const savg = !sAvg ? 0 : sAvg;

            if (data[q].netqty == 0) {
                data[q]["way"] = "close";
                closeposition.push(data[q]);
            } else {
                data[q]["way"] = "open";
                data[q]["disabled"] = false;
                openposition.push(data[q]);
            }
            data[q]["totbuyavgprc"] = bavg;
            data[q]["totsellavgprc"] = savg;
            data[q]["tokn"] = data[q].token + "_" + q;
            data[q]["avgprc"] = data[q].netavgprc && Number(data[q].netavgprc) > 0 ? data[q].netavgprc : data[q].netupldprc && Number(data[q].netupldprc) > 0 ? data[q].netupldprc : data[q].upldprc && Number(data[q].upldprc) > 0 ? data[q].upldprc : data[q].dayavgprc;
            data[q]["crpnl"] = data[q]["rpnl"];

            data[q]["tempqty"] = (parseFloat(data[q]['daybuyqty'] || "0") + parseFloat(data[q]['cfbuyqty'] || "0")) < (parseFloat(data[q]['daysellqty'] || "0") + parseFloat(data[q]['cfsellqty'] || "0")) ? parseFloat(data[q]['daybuyqty'] || "0") : parseFloat(data[q]['daysellqty'] || "0");
            data[q]["tempqty"] = (data[q]["tempqty"] * data[q].prcftr)
            data[q]["tempavg"] = data[q].netqty > 0 ? Number(data[q]['daysellavgprc']) - parseFloat(data[q]['netupldprc'] || "0") : parseFloat(data[q]['netupldprc'] || "0") - Number(data[q]['daybuyavgprc']);
            data[q]["temprpnl"] = data[q]["tempavg"] * data[q]["tempqty"];
        }
        positiondata = { a: data, o: openposition, c: closeposition };
    } else if (data != 500) {
        positiondata = data
    }
    // Always dispatch event after storing new data (with delay to ensure listeners are ready)
    if (flowis && positiondata && (positiondata.a || positiondata.o)) {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('tempdata-update', { detail: positiondata }));
        }, 150);
    }
    return positiondata
}

export async function getMPosotionCon(item) {
    requestMOption['body'] = `jData=${JSON.stringify(item)}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "ProductConversion", requestMOption)
    return response
}

export async function getQuotesdata(item) {
    // Get credentials from sessionStorage before making API call
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');

    // Update global variables for consistency
    uid = currentUid || uid;
    tok = currentTok || tok;

    if (!currentUid || !currentTok) {
        // console.error('getQuotesdata: uid or token not available from sessionStorage');
        return { stat: 'Not Ok', emsg: 'Authentication required' };
    }

    requestMOption['body'] = `jData={"uid":"${currentUid}","exch":"${item.split('|')[0]}","token":"${item.split('|')[1]}"}&jKey=${currentTok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetQuotes", requestMOption)
    return response
}

export async function getOptionschain(item) {
    requestMOption['body'] = item
    var response = await fetchMyntAPI(mynturl.myntapi + "GetOptionChain", requestMOption)
    return response
}

export async function getMFQuotesdata(item) {
    requestMOption['body'] = `jData={"uid":"${uid}","exch":"${item.split('|')[0]}","token":"${item.split('|')[1]}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetQuotesMF", requestMOption)
    return response
}

export async function getSecuritydata(item) {
    requestMOption['body'] = `jData={"uid":"${uid}","exch":"${item.split('|')[0]}","token":"${item.split('|')[1]}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetSecurityInfo", requestMOption)
    return response
}

export async function getTechnicals(item) {
    requestMOption['body'] = `jData={"uid":"${uid}","exch":"${item.split('|')[0]}","tsym":"${item.split('|')[2]}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetTechnicals", requestMOption)
    return response
}

export async function getLinkedScrips(item) {
    requestMOption['body'] = `jData={"uid":"${uid}","exch":"${item.split('|')[0]}","token":"${item.split('|')[1]}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetLinkedScrips", requestMOption)
    return response
}

export async function getOrderMargin(item) {
    requestMOption['body'] = `jData={"uid":"${uid}","actid":"${uid}","exch":"${item.exch}","tsym":"${item.tsym}","qty":"${item.qty}","prc":"${item.prc}","prd":"${item.prd}","trantype":"${item.trantype}","prctyp":"${item.prctyp}","trgprc":"${item.trgprc}","rorgqty":"0","rorgprc":"0"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetOrderMargin", requestMOption)
    return response
}

export async function getBSKMargin(item) {
    requestMOption['body'] = `jData=${JSON.stringify(item)}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetBasketMargin", requestMOption)
    // console.log('GetBasketMargin response:', response)
    return response
}

export async function getBrokerage(item) {
    requestMOption['body'] = `jData={"uid":"${uid}","actid":"${uid}","exch":"${item.exch}","tsym":"${item.tsym}","qty":"${item.qty}","prc":"${item.prc}","prd":"${item.prd}","trantype":"${item.trantype}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetBrokerage", requestMOption)
    return response
}

export async function getPlaceOrder(item, type) {
    // Always refresh session tokens before placing/modifying orders
    try {
        uid = sessionStorage.getItem('userid') || uid
        tok = sessionStorage.getItem('msession') || tok
    } catch (_) { }
    if (type != 'can-ex') {
        if (item.tsym) {
            item.tsym = encodeURIComponent(item.tsym);
        }
        item['app_inst_id'] = sessionStorage.getItem("imei");
        item['usr_agent'] = navigator.appVersion;
        item['ipaddr'] = localStorage.getItem("uuidipadd");
    }
    requestMOption['body'] = `jData=${JSON.stringify(item)}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + (type == 'can-ex' ? "ExitSNOOrder" : type == 'can' ? "CancelOrder" : type == 'mod' ? "ModifyOrder" : "PlaceOrder"), requestMOption)
    return response
}

export async function getSIPOrderset(item, url) {
    try {
        uid = sessionStorage.getItem('userid') || uid
        tok = sessionStorage.getItem('msession') || tok
    } catch (_) { }
    requestMOption['body'] = `jData=${JSON.stringify(item)}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + url, requestMOption)
    return response
}

export async function getGTTPlaceOrder(item, url) {
    try {
        uid = sessionStorage.getItem('userid') || uid
        tok = sessionStorage.getItem('msession') || tok
    } catch (_) { }
    requestMOption['body'] = `jData=${JSON.stringify(item)}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + url, requestMOption)
    return response
}

export async function setMalert(item, type) {
    requestMOption['body'] = `jData=${JSON.stringify(item)}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + (type == 'cancel' ? 'CancelAlert' : type ? "ModifyAlert" : "SetAlert"), requestMOption)
    return response
}

export async function getMOrderbook(flowis) {
    const store = getAppStore();

    // Get credentials from sessionStorage
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');

    if (!currentUid || !currentTok) {
        return { response: [], openorders: [], execorders: [], stat: [0, 0, 0] };
    }

    requestMOption['body'] = `jData={"uid":"${currentUid}","actid":"${currentUid}"}&jKey=${currentTok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "OrderBook", requestMOption)
    var execorders = [];
    var openorders = [];
    var stat = [0, 0, 0]

    if (response && response.length > 0) {
        for (let q = 0; q < response.length; q++) {
            response[q]["idx"] = q;
            if (response[q].status == "PENDING" || response[q].status == "OPEN" || response[q].status == "TRIGGER_PENDING") {
                response[q]["exord"] = ((response[q].s_prdt_ali == "BO" || response[q].s_prdt_ali == "CO") && response[q].snonum) ? true : false;
                response[q]["way"] = "open";
                openorders.push(response[q]);
                response[q]['disabled'] = false;
            } else {
                response[q]["way"] = "exec";
                execorders.push(response[q]);
            }
            response[q]["value"] = response[q].qty * response[q].avgprc;
            if (response[q].status == "PENDING" || response[q].status == "OPEN" || response[q].status == "TRIGGER_PENDING") {
                stat[0] += 1;
            } else if (response[q].status == "COMPLETE") {
                stat[1] += 1;
            } else {
                stat[2] += 1;
            }
        }
    }
    if (response != 500) {
        ordersdata = { response: response, openorders: openorders, execorders: execorders, stat: stat };
        // Always dispatch event after storing new data (with delay to ensure listeners are ready)
        if (flowis && ordersdata && ordersdata.stat) {
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('tempdata-update', { detail: ordersdata }));
            }, 150);
        }
    }
    return ordersdata
}

export async function getMTradebook(item) {
    requestMOption['body'] = item
    var response = await fetchMyntAPI(mynturl.myntapi + "TradeBook", requestMOption)
    return response
}

export async function getSiporderbook(item) {
    requestMOption['body'] = item
    var response = await fetchMyntAPI(mynturl.myntapi + "SipOrderBook", requestMOption)
    return response
}

export async function getUserDetails() {
    requestMOption['body'] = `jData={"uid":"${uid}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "UserDetails", requestMOption)
    return response
}

export async function getSingleorderbook(id) {
    requestMOption['body'] = `jData={"uid":"${uid}","norenordno":"${id}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "SingleOrdHist", requestMOption)
    return response
}

export async function getGttorderbook() {
    requestMOption['body'] = `jData={"uid":"${uid}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetPendingGTTOrder", requestMOption)
    return response
}

export async function setCancelGTT(item) {
    requestMOption['body'] = item
    var response = await fetchMyntAPI(mynturl.myntapi + "CancelGTTOrder", requestMOption)
    return response
}

export async function getAlertAPi(url) {
    // Use freshest credentials from session storage to avoid 401 at initial stage
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');

    if (!currentUid || !currentTok) {
        // Return empty array to callers that expect list results
        return [];
    }
    requestMOption['body'] = `jData={"uid":"${currentUid}"}&jKey=${currentTok}`
    var response = await fetchMyntAPI(mynturl.myntapi + url, requestMOption)
    return response
}

export async function getMLimits(format, forceRefresh = false) {
    // Get credentials from sessionStorage
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');

    if (!currentUid || !currentTok) {
        return { stat: 'Error' };
    }

    // STRICT "CALL ONLY ONCE" LOGIC:
    // If API has already been called once and this is not a forced refresh, return cached data
    if (limitsApiState.hasBeenCalledOnce && !forceRefresh) {
        // console.log('🚫 Limits API already called once. Returning cached data. Use forceRefreshMLimits() for manual refresh.');
        return limitsApiState.cachedData || { stat: 'Error', emsg: 'Limits data not yet loaded' };
    }

    // If there's a pending call, return the same promise (prevent concurrent calls)
    if (limitsApiState.isPending && limitsApiState.pendingPromise) {
        // console.log('🔄 Limits API call already in progress, reusing existing promise...');
        return await limitsApiState.pendingPromise;
    }

    // Check cache (return cached data if available and not forcing refresh)
    if (limitsApiState.cachedData && !forceRefresh) {
        // console.log('💾 Returning cached Limits data');
        return limitsApiState.cachedData;
    }

    // Set pending state and mark as called
    limitsApiState.isPending = true;
    if (!forceRefresh) {
        limitsApiState.hasBeenCalledOnce = true;
    }

    const apiCallPromise = (async () => {
        try {
            requestMOption['body'] = `jData={"uid":"${currentUid}","actid":"${currentUid}"}&jKey=${currentTok}`
            var response = await fetchMyntAPI(mynturl.myntapi + 'Limits', requestMOption)
            if (response && response.stat == "Ok") {
                var total = (((Number(response.collateral) ? Number(response.collateral) : 0) + ((Number(response.brkcollamt)) ? (Number(response.brkcollamt)) : 0) + (Number(response.cash) ? Number(response.cash) : 0) + (Number(response.payin) ? Number(response.payin) : 0)) - (Math.abs(Number(response.daycash) ? Number(response.daycash) : 0)))
                response["total"] = !format ? total : (total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });

                var sum = ((Number(response.collateral) ? Number(response.collateral) : 0) + (Number(response.brkcollamt) ? Number(response.brkcollamt) : 0) + (Number(response.cash) ? Number(response.cash) : 0)) - Number(response.marginused ?? 0) + (Number(response.payin) ? Number(response.payin) : 0) - (Math.abs(Number(response.daycash)) ? Math.abs(Number(response.daycash)) : 0);
                response["opnbal"] = (((Number(response.cash)) ? (Number(response.cash)) : 0) + (Number(response.payin) ? Number(response.payin) : 0) - (Math.abs(Number(response.daycash) ? Number(response.daycash) : 0)))

                response["collateral"] = ((Number(response["collateral"]) ? Number(response["collateral"]) : 0) + (Number(response.brkcollamt) ? Number(response.brkcollamt) : 0)).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                response["avbma"] = (sum > 0 || sum < 0) ? !format ? sum : (sum).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }) : 0;
                if (format) {
                    for (const [key, value] of Object.entries(response)) {
                        if (key && value && Number(value)) {
                            response[key] =
                                Number(value) != 0
                                    ? Number(value).toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })
                                    : null;
                        }
                    }
                }

                // Cache the response permanently
                limitsApiState.cachedData = response;
                limitsApiState.cacheExpiry = Date.now() + limitsApiState.cacheDurationMs;
            }

            return response;
        } finally {
            // Always clear pending state
            limitsApiState.isPending = false;
            limitsApiState.pendingPromise = null;
        }
    })();

    // Store promise so concurrent calls can reuse it
    limitsApiState.pendingPromise = apiCallPromise;

    return await apiCallPromise;
}

// Force refresh Limits API (for manual refresh only)
export async function forceRefreshMLimits(format) {
    // console.log('🔄 Force refreshing Limits API...');
    limitsApiState.hasBeenCalledOnce = false; // Reset flag to allow refresh
    return await getMLimits(format, true);
}

export async function getTotpreq(val) {
    seyCheckwebsocket()
    requestMOption['body'] = `jData={"uid":"${uid}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + (val ? "GenSecretKey" : "GetSecretKey"), requestMOption)
    return response
}

export async function getApikeyreq() {
    seyCheckwebsocket()
    requestMOption['body'] = `jData={"uid":"${uid}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "RequestApiKey", requestMOption)
    return response
}

export async function getUserApikeyreq(time, status) {
    seyCheckwebsocket()
    requestMOption['body'] = `jData={"uid":"${uid}", "valTime":"${time}"}${status ? `, "status":"${status}"` : ''}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetUserApiKey", requestMOption)
    return response
}

export async function getApikeyData() {
    seyCheckwebsocket()
    requestMOption['body'] = `jData={"app_key":"${uid}_U"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "GetAppKeyData", requestMOption)
    return response
}

export async function getApiKeyStore(item) {
    seyCheckwebsocket()
    const ipaddrArray = [{ "ipaddr": item.primaryIp }]
    if (item.backupIp) {
        ipaddrArray.push({ "ipaddr": item.backupIp })
    }
    requestMOption['body'] = `jData={"app_key":"${item.clientId}","sec_code":"${item.secretCode}","red_url":"${item.url}","dname":"${uid} s apikey","ipaddr": ${JSON.stringify(ipaddrArray)},"uid": [{"uid":"${uid}"}]}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "AppKeyStore", requestMOption)
    return response
}


export async function getClientDetails() {
    // Get fresh tokens from sessionStorage before making API call
    seyCheckwebsocket();

    var response;
    if (clientdetails && clientdetails.stat == "Ok") {
        response = clientdetails
    } else {
        // Ensure uid and tok are available
        if (!uid || !tok) {
            uid = sessionStorage.getItem('userid');
            tok = sessionStorage.getItem('msession');
        }

        // Only make API call if we have valid tokens
        if (uid && tok) {
            requestMOption['body'] = `jData={"uid":"${uid}","actid":"${uid}"}&jKey=${tok}`
            response = await fetchMyntAPI(mynturl.myntapi + "ClientDetails", requestMOption)
            if (response && response.stat == "Ok") {
                clientdetails = response;
            }
        } else {
            // Return error response if no valid tokens
            response = { stat: "Not Ok", emsg: "Authentication required" };
        }
    }
    return response
}

export async function getMyntLogout(inn) {
    requestMOption['body'] = `jData={"uid":"${uid}","source":"${inn}"}&jKey=${tok}`
    var response = await fetchMyntAPI(mynturl.myntapi + "Logout", requestMOption)
    return response
}

export async function getEXPosition() {
    requestOptions['body'] = `{"client_id":"${uid}"}`
    var response = await fetchMyntAPI(apiurl.exmynt + "api/GetPosition", requestOptions)
    return response
}

export async function getOIbars(tsym) {
    requestOptions['body'] = `{"value":"${tsym}","count":"30"}`
    var response = await fetchMyntAPI(apiurl.exmynt + "/get_oi_bar", requestOptions)
    return response
}

// single stocks equity API
export async function getPostPnL(data) {
    // Use freshest credentials to avoid 401 at initial stage
    const currentUid = sessionStorage.getItem('userid');
    const currentTok = sessionStorage.getItem('msession');
    if (!currentUid || !currentTok) {
        return { mtm: [] }
    }
    requestOptions['body'] = JSON.stringify({ clientid: currentUid, session: currentTok, source: mynturl.source, chartdata: data })
    var response = await fetchMyntAPI(apiurl.eqapi + "positionpnlmargin", requestOptions)
    return response
}

export async function getssNews() {
    const requestKey = 'newsfeedin';
    console.log('[getAPIdata] getssNews called');

    if (pendingRequests.has(requestKey)) {
        console.log('[getAPIdata] getssNews: Returning pending request');
        try {
            return await pendingRequests.get(requestKey);
        } catch (error) {
            console.error('[getAPIdata] getssNews: Pending request failed', error);
            pendingRequests.delete(requestKey);
            throw error;
        }
    }

    const requestPromise = (async () => {
        try {
            const publicOptions = createPublicRequestOptions();

            // ❗ Remove body for GET requests
            delete publicOptions.body;

            const url = apiurl.sessapi + "newsfeedin?pagesize=5&pagecount=1&filterdate=monthly";
            console.log('[getAPIdata] getssNews: Fetching URL:', url);
            console.log('[getAPIdata] getssNews: Options:', { ...publicOptions, method: 'GET' });

            var response = await fetchMyntAPI(
                url,
                { ...publicOptions, method: 'GET' }
            );
            console.log('[getAPIdata] getssNews: Response received:', response);

            pendingRequests.delete(requestKey);
            return response;

        } catch (error) {
            console.error('[getAPIdata] getssNews: Error fetching news:', error);
            pendingRequests.delete(requestKey);
            throw error;
        }
    })();

    pendingRequests.set(requestKey, requestPromise);

    return await requestPromise;
}


export async function getCorporateact() {
    // Create request key for deduplication
    const requestKey = 'getCorporateAction';

    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
        // console.log(`🔄 Reusing pending request: ${requestKey}`);
        try {
            return await pendingRequests.get(requestKey);
        } catch (error) {
            // If pending request failed, remove it and continue
            pendingRequests.delete(requestKey);
            throw error;
        }
    }

    // Create request promise
    const requestPromise = (async () => {
        try {
            // Use public request options (no auth headers) for public API
            const publicOptions = createPublicRequestOptions();
            publicOptions['body'] = "";
            var response = await fetchMyntAPI(apiurl.iposapi + "getCorporateAction", publicOptions);
            pendingRequests.delete(requestKey);
            return response;
        } catch (error) {
            pendingRequests.delete(requestKey);
            throw error;
        }
    })();

    // Store promise in pending requests map
    pendingRequests.set(requestKey, requestPromise);

    return await requestPromise;
}

export async function getssDetails(item) {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = `{"symbol":"${item}"}`
    var response = await fetchMyntAPI(apiurl.eqapi + "stockFundamentalDetails", publicOptions)
    return response
}

export async function getQuotedata(item) {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = `{"symbol":"${item}"}`
    var response = await fetchMyntAPI(apiurl.eqapi + "getQuotes", publicOptions)
    return response
}

export async function getSectordata() {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.eqapi + "getSector", publicOptions)
    return response
}

export async function getIndexList() {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.eqapi + "GetIndexList", publicOptions)
    return response
}

export async function getTopList(item) {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = `{"exch":"${item[0]}","bskt":"${item[1]}","crt":"${item[2]}"}`
    var response = await fetchMyntAPI(apiurl.eqapi + "TopList", publicOptions)
    return response
}

export async function getConTentList(item) {
    // Create request key for deduplication (include parameters to allow different calls)
    const requestKey = `GetContentList_${item[0]}_${item[1]}_${item[2]}`;

    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
        // console.log(`🔄 Reusing pending request: ${requestKey}`);
        try {
            return await pendingRequests.get(requestKey);
        } catch (error) {
            // If pending request failed, remove it and continue
            pendingRequests.delete(requestKey);
            throw error;
        }
    }

    // Create request promise
    const requestPromise = (async () => {
        try {
            // Use public request options (no auth headers) for public API
            const publicOptions = createPublicRequestOptions();
            publicOptions['body'] = `{"exch":"${item[0]}","basket":"${item[1]}","condition":"${item[2]}"}`
            var response = await fetchMyntAPI(apiurl.eqapi + "GetContentList", publicOptions);
            pendingRequests.delete(requestKey);
            return response;
        } catch (error) {
            pendingRequests.delete(requestKey);
            throw error;
        }
    })();

    // Store promise in pending requests map
    pendingRequests.set(requestKey, requestPromise);

    return await requestPromise;
}

export async function getADindices() {
    // Create request key for deduplication
    const requestKey = 'getadindicesAdvdec';

    // Check if same request is already pending
    if (pendingRequests.has(requestKey)) {
        // console.log(`🔄 Reusing pending request: ${requestKey}`);
        try {
            return await pendingRequests.get(requestKey);
        } catch (error) {
            // If pending request failed, remove it and continue
            pendingRequests.delete(requestKey);
            throw error;
        }
    }

    // Create request promise
    const requestPromise = (async () => {
        try {
            // Use public request options (no auth headers) for public API
            const publicOptions = createPublicRequestOptions();
            publicOptions['body'] = "";
            var response = await fetchMyntAPI(apiurl.eqapi + "getadindicesAdvdec", publicOptions);
            pendingRequests.delete(requestKey);
            return response;
        } catch (error) {
            pendingRequests.delete(requestKey);
            throw error;
        }
    })();

    // Store promise in pending requests map
    pendingRequests.set(requestKey, requestPromise);

    return await requestPromise;
}

export async function getADindice(index) {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = `{"index": "${index}"}`;
    var response = await fetchMyntAPI(apiurl.eqapi + "getadindices", publicOptions)
    return response
}

export async function getHLbreakers() {
    // Use public request options (no auth headers) for public API
    const publicOptions = createPublicRequestOptions();
    publicOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.eqapiD + "HLbreakers", publicOptions)
    return response
}

// Mutual Fund API
export async function getMFalldata() {
    requestOptions['body'] = `{"funds_name":"normal"}`
    var response = await fetchMyntAPI(apiurl.mfapi + "master_file_datas", requestOptions)
    return response
}

export async function getnewBestMF() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + "dashboard/getMfBaskets", requestOptions)
    return response
}

export async function gettopfirstapi() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + "dashboard/topschemes", requestOptions)
    return response
}

export async function getnewcatgreapi() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + "dashboard/getCategoryschemes", requestOptions)
    return response
}

export async function getBestMF() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfapi + "z_data", requestOptions)
    return response
}

export async function getMFmandate(item) {
    requestOptions['body'] = `{"client_code":"${item[0]}", "mandate_id":"${item[1]}", "from_date":"01/01/1900", "to_date":"31/12/${new Date().getFullYear()}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/mandate_details", requestOptions)
    return response
}

export async function getMFAddmandate(item) {
    requestOptions['body'] = `{"ClientCode":"${item[0]}", "amount":"${item[1]}", "startdate":"${item[2]}", "enddate":"${item[3]}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/mandate_creation", requestOptions)
    return response
}

export async function getMFsipvalue(item) {
    requestOptions['body'] = `{"isin":"${item[0]}", "scheme_code":"${item[1]}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/sip_values", requestOptions)
    return response
}

export async function getMFlumsum_order(item) {
    requestOptions['body'] = `{"ClientCode":"${item[0]}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/OrderBook", requestOptions)
    return response
}

export async function getmfsipnewapi() {
    requestOptions['body'] = `{"ClientCode":"${uid}","status":"ACTIVE"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/FetchSIP", requestOptions)
    return response
}

export async function getmfsipnewapihisty() {
    requestOptions['body'] = `{"ClientCode":"${uid}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/FetchSIP", requestOptions)
    return response
}

export async function getMFholdings() {
    requestOptions['body'] = `{"client_code":"${uid}"}`
    var response = await fetchMyntAPI(apiurl.mfapi + "GetHoldings", requestOptions)
    return response
}

export async function getMFBankdetails() {
    requestOptions['body'] = `{"client_code":"${uid}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/client_bank_details", requestOptions)
    return response
}

export async function getMFwatchlist(data) {
    requestOptions['body'] = data
    var response = await fetchMyntAPI(apiurl.mfnewapi + "dashboard/watchlist_for_mobile", requestOptions)
    return response
}

export async function getMFnofdata() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + "dashboard/NFO_datas", requestOptions)
    return response
}

export async function getMFsheetdata(key) {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + `singlepage/getFactSheetData?ISIN=${key}`, requestOptions)
    return response
}

export async function getMFNAVchart(key, frmdate, todate) {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + `singlepage/getNavGraph?ISIN=${key}&fromDate=${frmdate}&toDate=${todate}`, requestOptions)
    return response
}

export async function getMFSchemePeers(key, year) {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + `singlepage/getSchemePeers?ISIN=${key}&year=${year}`, requestOptions)
    return response
}

export async function getMFsheetchart(key) {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + `singlepage/getFactSheetGraph?ISIN=${key}`, requestOptions)
    return response
}

export async function getMFrollschart(isin, date, year) {
    requestOptions['body'] = `{"ISIN":${isin},"startdate":"${date}","year":"${year}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + `singlepage/postRollingReturn`, requestOptions)
    return response
}

export async function getXsiporder(item) {
    requestOptions['body'] = `{"client_code":"${uid}","order_number":"${item[0]}","date":"${item[1]}"}`
    var response = await fetchMyntAPI(apiurl.mfapi + "child_order_details", requestOptions)
    return response
}

export async function getMFcancellum(item, type) {
    requestOptions['body'] = `{"ClientCode":"${uid}","OrderId":"${item}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + (type == 'R' ? 'lumsum_redemption_cancel' : "order/lumpsum_purchase_cancel"), requestOptions)
    return response
}

export async function getMFcancelxsip(item) {
    requestOptions['body'] = `{"ClientCode":"${uid}","SIPRegnNo":"${item[1]}","scheme_code":"${item[2]}","CaseNo":"${item[3]}","remarks":"${item[4]}","source": "web","placed_by": "${uid}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + "order/xsip_cancel", requestOptions)
    return response
}

export async function getMFcancelation() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.mfnewapi + `order/reasons`, requestOptions)
    return response
}

export async function getmfpauseapi(item) {
    requestOptions['body'] = `{"ClientCode":"${uid}","SIPRegnNo":"${item[1]}","scheme_code":"${item[2]}","installments":"${item[3]}","source": "web","placed_by": "${uid}"}`
    var response = await fetchMyntAPI(apiurl.mfnewapi + `order/xsip_pause`, requestOptions)
    return response
}

export async function getMFplaceoredr(url, item) {
    requestOptions['body'] = item;
    var response = await fetchMyntAPI(apiurl.mfnewapi + url, requestOptions)
    return response
}

export async function getMFallpayments(item) {
    requestOptions['body'] = item;
    var response = await fetchMyntAPI(apiurl.mfapi + `all_payment`, requestOptions)
    return response
}

export async function getsendpaymentrequt(data) {
    requestOptions['body'] = data
    var response = await fetchMyntAPI(apiurl.mfnewapi + `order/all_payment`, requestOptions)
    return response
}

export async function getcheckpaystatus(datapay) {
    requestOptions['body'] = datapay
    var response = await fetchMyntAPI(apiurl.mfnewapi + `order/get_payment_status`, requestOptions)
    return response
}

// Bonds API
export async function getBondGsec() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.bondapi + "getcurrentNCB_Gsecdetails", requestOptions)
    return response
}

export async function getBondTbill() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.bondapi + "getcurrentNCB_TBilldetails", requestOptions)
    return response
}

export async function getBondSdl() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.bondapi + "getcurrentNCB_SDLdetails", requestOptions)
    return response
}

export async function getBondSgb() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.bondapi + "getcurrentSGBdetails", requestOptions)
    return response
}

export async function getBondOrder(url, items) {
    requestOptions['body'] = items;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.bondapi + (url ? "addSGBtoPortfolio" : "addNCBtoPortfolio"), requestOptions)
    return response
}

// IPOs API
export async function getIposIpo() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.iposapi + "getcurrentIPOdetails", requestOptions)
    return response
}

export async function getIposPerform(year) {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.iposapi + `ipo_performer?year=${year}`, requestOptions)
    return response
}

export async function getIposSme() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.iposapi + "getcurrentSMEIPOdetails", requestOptions)
    return response
}

export async function getIposbook(item) {
    requestOptions['body'] = `{"client_id": "${item[0]}"}`;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.iposapi + "orderbookIPODetails", requestOptions)
    return response
}

export async function getIposorders(item) {
    requestOptions['body'] = `{"symbol":"${item[2]}","applicationNumber":"${item[3]}","type":"${item[4]}"}`;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.iposapi + "fetchIPODetail", requestOptions)
    return response
}

export async function getIposorder(item) {
    requestOptions['body'] = item;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.iposapi + "addIPOtoPortfolio", requestOptions)
    return response
}

// Collections API
export async function getCollections() {
    requestOptions['body'] = "";
    var response = await fetchMyntAPI(apiurl.collapi + "collectiondetails", requestOptions)
    return response
}

export async function getCollsingledata(item) {
    requestOptions['body'] = JSON.stringify({ basketid: item, client_id: null });
    var response = await fetchMyntAPI(apiurl.collapi + "singlebasketDateils", requestOptions)
    return response
}

export async function getCollchartdata(item) {
    requestOptions['body'] = JSON.stringify({ scripts: item[0], timeFrame: item[1] });
    var response = await fetchMyntAPI(apiurl.eqapi + "basketReturnsChartData", requestOptions)
    return response
}

export async function getCollstockdata(item) {
    requestOptions['body'] = JSON.stringify({ scripts: item[0], timeFrame: item[1] });
    var response = await fetchMyntAPI(apiurl.eqapi + "basketStocksData", requestOptions)
    return response
}

export async function getCollLtpdata(item) {
    requestOptions['body'] = JSON.stringify({ basketid: item, etfs_weights: "" });
    var response = await fetchMyntAPI(apiurl.collapi + "getltp", requestOptions)
    return response
}

export async function getCollplaceorder(url, data) {
    requestOptions['body'] = data;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.collapi + url, requestOptions);
    return response
}

export async function getFundsupis(item) {
    requestOptions['body'] = `{"client_id":"${item}"}`;
    var response = await fetchMyntAPI(apiurl.upiurl + "withdraw/view_upi_id", requestOptions);
    return response
}

export async function getUpivpa(item) {
    requestOptions['body'] = `{"VPA":"${item[0]}","clientID":"123456789","bank_acc":"123456789"}`;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.upiurl + "hdfc/upi/checkClientVPA", requestOptions);
    return response
}

export async function getBondLedger(item) {
    requestOptions['body'] = `{"clientid": "${item[0]}"}`;
    var response = await fetchMyntAPI(apiurl.ledger + "all_ledger_balance", requestOptions)
    return response
}

export async function getBondbook(item) {
    requestOptions['body'] = `{"client_id": "${item[0]}"}`;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.bondapi + "orderbookncbDetails", requestOptions)
    return response
}

export async function getBondsgbbook(item) {
    requestOptions['body'] = `{"client_id": "${item[0]}"}`;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.bondapi + "orderbooksgbDetails", requestOptions)
    return response
}

export async function getInvHoldings(item) {
    requestOptions['body'] = `{"cc": "${item[0]}", "to":""}`;
    setHeaderauth();
    var response = await fetchMyntAPI(apiurl.repapi + "getHoldings", requestOptions)
    return response
}

export async function getLtpdata(item) {
    // Validate input
    if (!item || !Array.isArray(item) || item.length === 0) {
        // console.warn('getLtpdata: Invalid input - item must be a non-empty array')
        return { data: null, error: 'Invalid input: item must be a non-empty array' }
    }

    // Validate each item in the array has required fields
    const invalidItems = item.filter(i => !i || !i.exch || !i.token || !i.tsym)
    if (invalidItems.length > 0) {
        // console.warn('getLtpdata: Invalid items in array - missing exch, token, or tsym', invalidItems)
        return { data: null, error: 'Invalid items: missing exch, token, or tsym' }
    }

    // Create a unique key for request deduplication based on the data
    const requestKey = JSON.stringify(item.sort((a, b) => {
        if (a.exch !== b.exch) return a.exch.localeCompare(b.exch)
        if (a.token !== b.token) return a.token.localeCompare(b.token)
        return a.tsym.localeCompare(b.tsym)
    }))

    // Check if there's already a pending request with the same data
    if (pendingRequests.has(requestKey)) {
        // console.log('[API] GetLtp request already pending for same data, reusing...')
        try {
            return await pendingRequests.get(requestKey)
        } catch (error) {
            // If the pending request failed, remove it and continue with new request
            pendingRequests.delete(requestKey)
        }
    }

    try {
        // Set authentication headers before making the API call
        setHeaderauth()
        requestOptions['body'] = `{ "data": ${JSON.stringify(item)} }`

        // Create the promise and store it in pendingRequests
        const requestPromise = fetchMyntAPI(apiurl.asvrapi + "GetLtp", requestOptions)
        pendingRequests.set(requestKey, requestPromise)

        var response = await requestPromise

        // Handle error response (500 indicates API error from fetchMyntAPI)
        if (response === 500) {
            // console.error('Error in getLtpdata: API returned 500 error')
            return { data: null, error: 'API Error: Server returned 500' }
        }

        // Handle error message in response
        if (response && response.emsg) {
            // console.error('Error in getLtpdata:', response.emsg)
            return { data: null, error: response.emsg }
        }

        // Handle empty or invalid response
        if (!response || (Array.isArray(response) && response.length === 0)) {
            // console.warn('getLtpdata: Empty or invalid response')
            return { data: null, error: 'No data returned from API' }
        }

        // Remove from pending requests after successful completion
        pendingRequests.delete(requestKey)
        return response
    } catch (error) {
        // Remove from pending requests on error
        pendingRequests.delete(requestKey)
        // console.error('Error in getLtpdata:', error)
        return { data: null, error: error.message || 'Unknown error occurred' }
    }
}

export async function getGreekoptions(item) {
    requestOptions['body'] = item
    var response = await fetchMyntAPI(apiurl.zebuApiUrl + "getoptiongreeks", requestOptions)
    return response
}

export async function getIndicators(uid) {
    try {
        // Use fetchWithTimeout to prevent indefinite hanging
        const response = await fetchWithTimeout(`https://be.mynt.in/getindicators?clientCode=${uid}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        }, 5000);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        if (error.message === 'Request timeout' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('Network error')) {
            // console.warn(`⚠️ getIndicators timeout/error: returning empty`);
        }
        throw new Error(`get symbols request error: ${error}`);
    }
}

export async function setIndicators(uid, c) {
    try {
        // Use fetchWithTimeout to prevent indefinite hanging
        const response = await fetchWithTimeout(`https://be.mynt.in/storeindicators?clientCode=${uid}&indicators=${JSON.stringify(c)}`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        }, 5000);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        if (error.message === 'Request timeout' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('Network error')) {
            // console.warn(`⚠️ setIndicators timeout/error: returning empty`);
        }
        throw new Error(`set symbols request error: ${error}`);
    }
}

export async function setOrdprefApi(data, url) {
    requestOptions['body'] = url ? JSON.stringify(data) : "";
    var response = (!url && orderprefdata && orderprefdata.metadata && orderprefdata.metadata.mainpreitems) ? orderprefdata
        : await fetchMyntAPI(apiurl.zebuApiUrl + (url ? "weblog/savepreference" : `weblog/getpreference?clientid=${uid}&source=WEB`), url ? requestOptions : { method: 'get' })
    orderprefdata = url ? data : response;
    return response
}

export async function getMasters(tsym) {
    let response = sllmasters?.[encodeURIComponent(tsym)];
    if (!response) {
        response = await fetchMyntjson(`${apiurl.zebuApiUrl}findsymbol?tsym=${encodeURIComponent(tsym)}`, {
            method: 'GET',
            redirect: 'follow'
        });
        if (response?.length > 3) {
            sllmasters[encodeURIComponent(tsym)] = response;
        }
    }
    return response;
}

export async function mastermfapi() {
    // Use production API endpoint instead of localhost
    var response = await fetchMyntjson(apiurl.masterfileapi + `master_file_datas`, {
        method: 'GET',
        redirect: 'follow'
    })
    return response
}

export async function fetchMyntAPI(path, reqopt, way) {
    const reqt = new Date().toLocaleString();
    const store = getAppStore();

    // Set default timeout to 5 seconds (5000ms) for faster failure detection on Firebase
    // No timeout for mutual fund watchlist operations - wait indefinitely for response
    const isMFWatchlist = path && path.includes('watchlist_for_mobile');

    try {
        // Use regular fetch for mutual fund watchlist (no timeout), fetchWithTimeout for others
        const response = isMFWatchlist
            ? await fetch(path, { ...reqopt, mode: 'cors', credentials: 'omit' })
            : await fetchWithTimeout(path, reqopt, 5000);
        // Get stores early for session validation
        const authStore = useAuthStore();
        const sessionStore = useSessionStore();

        // Check for 401 status BEFORE parsing JSON
        if (response.status === 401) {
            // console.error("❌ 401 Unauthorized error detected");

            // Try to parse error response body
            let errorData = null;
            try {
                const errorText = await response.text();
                if (errorText) {
                    errorData = JSON.parse(errorText);
                }
            } catch (parseError) {
                // console.warn("Could not parse 401 error response:", parseError);
            }

            // Check if error message contains "session expired : invalid session key"
            const errorMsg = errorData?.emsg || errorData?.message || "Session expired";
            const errorMsgLower = typeof errorMsg === 'string' ? errorMsg.toLowerCase() : '';
            const isSessionExpired = errorMsgLower.includes('session expired') &&
                errorMsgLower.includes('invalid session key');

            // Validate uid exists before logging out
            if (isSessionExpired && authStore.uid) {
                // console.error("❌ Session expired detected with valid uid, logging out:", errorMsg);

                // Create error object for handleSessionError
                const sessionError = {
                    emsg: errorMsg || "Session expired : Invalid Session Key"
                };

                // Handle session error immediately (logout and navigate)
                sessionStore.handleSessionError(sessionError, authStore, store);

                // Return error to prevent further processing
                return errorData || { stat: 'NotOk', emsg: errorMsg };
            } else {
                // 401 but not session expired or no uid - just show error
                if (errorData && errorData.emsg) {
                    store.showSnackbar(2, errorData.emsg);
                } else if (errorMsg) {
                    store.showSnackbar(2, errorMsg);
                }
                return errorData || { stat: 'NotOk', emsg: errorMsg };
            }
        }

        // Check if response is ok before parsing
        if (!response.ok) {
            // Try to parse error response body to get actual error message
            let errorData = null;
            try {
                const errorText = await response.text();
                if (errorText) {
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (parseError) {
                        // If JSON parsing fails, create error object with the text
                        errorData = {
                            stat: 'NotOk',
                            emsg: errorText || `HTTP error! status: ${response.status}`,
                            remarks: errorText || `HTTP error! status: ${response.status}`
                        };
                    }
                }
            } catch (textError) {
                // console.warn("Could not read error response body:", textError);
            }

            // Return error data if we successfully parsed it, otherwise throw
            if (errorData) {
                return errorData;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        let data = await response.json();
        data = JSON.stringify(data);
        data = JSON.parse(data);

        if (uid && tok) {
            const status = response.status;
            const rest = new Date().toLocaleTimeString();
            const msg = response.ok ? "ok" : data;
            const log = `${status} || t: ${reqt} - ${rest} || ${path.split('.in')[1]} || m: ${msg}`;
            saveApiLog(log, reqt);
        }

        if (way) {
            if (requestMOption.body) {
                delete requestMOption.body;
            }
        } else {
            if (requestOptions.body) {
                delete requestOptions.body;
            }
        }

        // Check for session errors in response body (exact same as old app logic)
        if (data && data.emsg) {
            // Check if it's "another system" error or session expired
            const errorMsg = data.emsg;
            const errorMsgLower = typeof errorMsg === 'string' ? errorMsg.toLowerCase() : '';
            const isSessionError = errorMsgLower.includes('another system') ||
                errorMsgLower.includes('already logged in') ||
                errorMsgLower.includes('logged in on') ||
                (errorMsgLower.includes('session expired') &&
                    errorMsgLower.includes('invalid session key'));

            if (isSessionError) {
                // Validate uid exists before logging out
                if (authStore.uid) {
                    // Immediate logout when session ends or logged in on another system
                    // console.error("❌ Session error detected in response body:", errorMsg);

                    // Handle session error immediately (logout and navigate)
                    sessionStore.handleSessionError(data, authStore, store);

                    // Return error to prevent further processing
                    return data;
                } else {
                    // No uid, just show error
                    store.showSnackbar(2, errorMsg);
                    return data;
                }
            }
        }

        return data;

    } catch (error) {
        console.error('[fetchMyntAPI] Error caught:', error);
        if (uid && tok) {
            const rest = new Date().toLocaleString();
            const status = error.status || 0;
            const msg = error.message || "Unknown error";
            const log = `${status} || t: ${reqt} - ${rest} || ${path.split('.in')[1]} || m: ${msg}`;
            saveApiLog(log, reqt);
        }

        // Handle timeout errors gracefully - don't block UI
        if (error.message === 'Request timeout' || error.name === 'AbortError' || error.message?.includes('timeout')) {
            // console.warn(`⚠️ API request timeout (5s): ${path} - continuing without blocking UI`);
            // Return empty/error response instead of blocking
            if (way) {
                if (requestMOption.body) {
                    delete requestMOption.body;
                }
            } else {
                if (requestOptions.body) {
                    delete requestOptions.body;
                }
            }
            return { stat: 'NotOk', emsg: 'Request timeout' };
        }

        // Handle network/CORS errors gracefully
        if (error.message?.includes('Network error') || error.message?.includes('Failed to fetch') || error.message?.includes('CORS')) {
            // console.warn(`⚠️ Network/CORS error: ${path} - continuing without blocking UI`);
            if (way) {
                if (requestMOption.body) {
                    delete requestMOption.body;
                }
            } else {
                if (requestOptions.body) {
                    delete requestOptions.body;
                }
            }
            return { stat: 'NotOk', emsg: 'Network error' };
        }

        // Check for 401 errors (unauthorized - likely session expired or another system login)
        if (error.status === 401) {
            // console.error("❌ 401 Unauthorized error detected in catch block");

            // Get stores
            const authStore = useAuthStore();
            const sessionStore = useSessionStore();

            // Check if user is logged in and validate uid
            if (authStore.uid && authStore.token) {
                // Try to extract error message from error object
                let errorMsg = "Session expired : Invalid Session Key";
                if (error.message && typeof error.message === 'string') {
                    errorMsg = error.message;
                } else if (error.emsg) {
                    errorMsg = error.emsg;
                }

                // Check if it's the specific session expired message
                const errorMsgLower = typeof errorMsg === 'string' ? errorMsg.toLowerCase() : '';
                const isSessionExpired = errorMsgLower.includes('session expired') &&
                    errorMsgLower.includes('invalid session key');

                if (isSessionExpired) {
                    // Create error object similar to API response
                    const sessionError = {
                        emsg: errorMsg
                    };

                    // Handle session error immediately (logout and navigate)
                    sessionStore.handleSessionError(sessionError, authStore, store);
                } else {
                    // 401 but not session expired - just show error
                    store.showSnackbar(2, errorMsg);
                }
            } else {
                // Just show snackbar if no auth
                store.showSnackbar(2, error.message || "Unauthorized");
            }
        }

        if (way) {
            if (requestMOption.body) {
                delete requestMOption.body;
            }
        } else {
            if (requestOptions.body) {
                delete requestOptions.body;
            }
        }
        console.error('[fetchMyntAPI] Returning 500 due to unhandled error:', error);
        return 500;
    }
}

function saveApiLog(log, requestTime) {
    const logs = JSON.parse(localStorage.getItem(`${uid}_apiLogs`) || '[]');
    const currentLogDate = getDateOnly(requestTime);
    const firstLogDate = logs.length ? logs[0] : null;
    if (currentLogDate && typeof firstLogDate === 'string' && firstLogDate.includes(currentLogDate)) {
        logs.unshift(log);
    } else {
        logs.length = 0;
        logs.unshift(log);
    }
    localStorage.setItem(`${uid}_apiLogs`, JSON.stringify(logs));
}

function getDateOnly(dateString) {
    return dateString.slice(0, 10)
}

export async function fetchMyntjson(path, options = {}) {
    // Set default timeout to 5 seconds
    const timeout = 5000;

    try {
        // Use fetchWithTimeout to prevent indefinite hanging
        const response = await fetchWithTimeout(path, options, timeout);

        // Check if response is ok before parsing
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        data = JSON.stringify(data);
        data = JSON.parse(data);
        return data
    } catch (error) {
        // Handle timeout and network errors gracefully
        if (error.message === 'Request timeout' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('Network error') || error.message?.includes('Failed to fetch')) {
            // console.warn(`⚠️ fetchMyntjson timeout/error (5s): ${path} - returning empty array`);
        }
        let data = []
        return data
    }
}

export function seteEcryption(item) {
    var payld = JSON.stringify({
        clientid: item,
    });

    const payload = payld;
    var derived_key = CryptoJS.enc.Base64.parse(btoa("N#j2L^8pq9Fb$d@1"));
    var iv = CryptoJS.enc.Utf8.parse("3790514682037125");
    var test = CryptoJS.AES.encrypt(payload, derived_key, { iv: iv, mode: CryptoJS.mode.CBC }).toString();
    return test;
}

export function setDecryption(payld) {
    const payload = payld;
    const derived_key = CryptoJS.enc.Base64.parse(btoa("N#j2L^8pq9Fb$d@1"));
    const iv = CryptoJS.enc.Utf8.parse("3790514682037125");
    const encryptedData = payload;

    const decrypted = CryptoJS.AES.decrypt(encryptedData, derived_key, { iv, mode: CryptoJS.mode.CBC });
    const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}

export async function FetchsearchData(path, reqopt) {
    // Set default timeout to 5 seconds
    const timeout = 5000;

    try {
        // Use fetchWithTimeout to prevent indefinite hanging
        const response = await fetchWithTimeout(path, reqopt, timeout);

        // Check if response is ok before parsing
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();
        return data
    } catch (error) {
        // Handle timeout and network errors gracefully
        if (error.message === 'Request timeout' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('Network error') || error.message?.includes('Failed to fetch')) {
            // console.warn(`⚠️ FetchsearchData timeout/error (5s): ${path} - returning empty array`);
            return [];
        }
        return error
    }
}

export function getMHoldingdata() {
    if (holdingsdata && holdingsdata.response && holdingsdata.response.length > 0) {
        return holdingsdata.response
    }
    return []
}

// Export Firebase functions for use in components
export { firebase, source };
