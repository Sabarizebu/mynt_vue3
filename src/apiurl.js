// var requestOptions = {
//   method: 'POST',
//   redirect: 'follow'
// };
// const response = await axios('https://sess.mynt.in/getoken', requestOptions);

// export const uid = response.data.uid;
// export const tok = response.data.token;
var url = new URL(window.location.href).searchParams;
export const params = url.get("src") == 'app';
// export const mynturl = {}
export const mynturl = { myntapi: "https://go.mynt.in/NorenWClientWeb/", webSocketURL: "wss://go.mynt.in/NorenWSWeb/", source: "API" }

export const myntDCUrl = "https://go.mynt.in/chartApi/";
var uid = url.get("user");
var sess = url.get("usession");
var theme = url.get("dark");

export const myntappurl = { wss: "wss://ws.zebull.in/NorenWS/", "clientid": uid, "token": sess, myntapi: "https://go.mynt.in/NorenWClient/", source: "MOB", theme: theme == "true" ? true : false }
// {
//     "clientid": "ZSK162",
//     "token": "3d272ab47101a5ebc594ef5ac0b08c42697326b50dfb5bdbe749e32335a4d721",
//     "apitoken": "1636c1dc01953c95753ff0dcd2f301e28bde24c4806343a0766988c564b84311",
//     "url": "https://go.mynt.in/NorenWClientTV/",
//     "wss": "wss://go.mynt.in/NorenWSTV/",
//     "source": "TV",
//     "stat": "Ok",
//     "mobile": "9361411642",
//     "name": "RAGAVENDRAN S"
// }
// {apitoken: 099bcad7a324d7b12312a1eef33c27bc2d9c3f9539b77e20b636b2268f2a53aa, clientid: ZP00285, mobile: 7639366224, name: VENKATESHWARAN, stat: Ok, token: bbd8e423753360114e7c4ec0d814aa12a05b4b91b5dc6dfc95fdf8e33a332b88, source: MOB, url: https://go.mynt.in/NorenWClient/, wss: wss://go.mynt.in/NorenWS/, emsg: null}
// http://localhost:8080/tv?src=app&symbol=BSE%3ASENSEX&user=ZSK162&usession=1636c1dc01953c95753ff0dcd2f301e28bde24c4806343a0766988c564b84311&token=1&exch=BSE&res=5&dark=false

// export const source = "TV"
// export const source = "API"
// export const source = "WEB"
export const excs = "NSE"

export default {
  // NorenWClientTV 
  // NorenWClientTP
  // NorenWClientWeb
  banklogo: 'https://ekycbe.mynt.in/zebu',

  imgicon: "https://besim.zebull.in/static/equity/icons/",
  searchapi: 'https://v3.mynt.in/search/',

  // eqapi: 'https://v3.mynt.in/equity/',
  eqapi: 'https://eqapi.zebuetrade.com/',
  // eqapiD: 'http://192.168.5.138:5000/',

  copy: 'https://copy.mynt.in/',

  // mfapi: 'http://192.168.5.175:5000',
  mfapi: 'https://v3.mynt.in/mf/',
  mfnewapi: 'https://v3.mynt.in/mfapi/',
  masterfileapi: 'https://v3.mynt.in/mf/',

  exmynt: 'https://be.zebull.in/',
  // Dmfapi: 'http://192.168.5.192:5000/',

  bondapi: 'https://besim.zebull.in/',
  iposapi: 'https://v3.mynt.in/ipo/',

  // collapi: 'http://192.168.5.179:5111/',
  collapi: 'https://v3.mynt.in/collection/',


  ledger: 'https://rekycbe.mynt.in/',
  upiurl: 'https://fundapi.mynt.in/',
  repapi: 'https://rekycbe.mynt.in/report/',

  asvrapi: 'https://asvr.mynt.in/bcast/',

  autho: 'https://rekycbe.mynt.in/autho/',
  sessapi: "https://sess.mynt.in/",

  zebuApiUrl: "https://be.mynt.in/",
}
