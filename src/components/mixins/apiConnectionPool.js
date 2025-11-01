import { myntappurl, params } from '../../apiurl'

export var userid;
export var usession;

// Initialize on load
checkWebsocket();

function checkWebsocket() {
    if (params) {
        userid = myntappurl.clientid
        usession = myntappurl.token
    } else {
        userid = sessionStorage.getItem('userid')
        usession = sessionStorage.getItem('msession')
    }
}


export async function makeApiRequest(path, request) {
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            redirect: 'follow',
            headers: myHeaders,
            body: request
        };
        const response = await fetch(path, requestOptions);
        // if (!response.ok) {
        return response.json();
        // }
    } catch (error) {
        throw new Error(`zebull symbols request error: ${error.status}`);
    }
}