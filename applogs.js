
let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var requestOptions = {
  method: 'POST',
  redirect: 'follow',
  headers: myHeaders
};

startCollect();
setInterval(() => {
  startCollect();
}, 99999);
async function startCollect() {
  const s = sessionStorage.getItem('c3RhdHVz');
  const c = sessionStorage.getItem('userid');
  const x = sessionStorage.getItem('msession');
  const r = sessionStorage.getItem('socsrc');
  const e = sessionStorage.getItem('imei');
  if (s == 'dmFsaWR1c2Vy' && c) {
    const l = JSON.parse(localStorage.getItem(`${c}_apiLogs`) || '[]');
    if (l && l.length > 0) {
      await fetchMyntAPI({ uid: `${c}_${e}`, log: { data: l, sess: x, soc: r} }, c);
      sessionStorage.setItem(`${c}_lst_Log_up`, `${new Date().toLocaleString()}`);
    }
  }
}

async function fetchMyntAPI(r, c) {
  try {
    requestOptions['body'] = JSON.stringify(r);
    const response = await fetch("https://be.mynt.in/weblog/addlog", requestOptions);
    let data = await response.json();
    data = JSON.stringify(data);
    data = JSON.parse(data);
    return data;
  } catch (error) {
    const rest = new Date().toLocaleString();
    const status = error.status || 0;
    const msg = error.message || "Unknown error";
    const log = `${status} || t: ${rest} || /weblog/addlog || m: ${msg}`;
    saveApiLog(c, log);
    return error;
  }
}

function saveApiLog(uid, log) {
  const logs = JSON.parse(localStorage.getItem(`${uid}_apiLogs`) || '[]');
  logs.unshift(log);
  localStorage.setItem(`${uid}_apiLogs`, JSON.stringify(logs));
}