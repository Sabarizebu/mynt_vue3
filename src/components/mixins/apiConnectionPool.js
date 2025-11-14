import { myntappurl, params } from '../../apiurl'
import { useAuthStore } from '../../stores/authStore'
import { useSessionStore } from '../../stores/sessionStore'
import { useAppStore } from '../../stores/appStore'

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
        
        // Check for 401 status BEFORE parsing JSON
        if (response.status === 401) {
            console.error("❌ 401 Unauthorized error detected in makeApiRequest");
            
            // Get stores for session validation
            const authStore = useAuthStore();
            const sessionStore = useSessionStore();
            const appStore = useAppStore();
            
            // Try to parse error response body
            let errorData = null;
            try {
                const errorText = await response.text();
                if (errorText) {
                    errorData = JSON.parse(errorText);
                }
            } catch (parseError) {
                console.warn("Could not parse 401 error response:", parseError);
            }
            
            // Check if error message contains "session expired : invalid session key"
            const errorMsg = errorData?.emsg || errorData?.message || "Session expired";
            const errorMsgLower = typeof errorMsg === 'string' ? errorMsg.toLowerCase() : '';
            const isSessionExpired = errorMsgLower.includes('session expired') && 
                errorMsgLower.includes('invalid session key');
            
            // Validate uid exists before logging out
            if (isSessionExpired && authStore.uid) {
                console.error("❌ Session expired detected with valid uid, logging out:", errorMsg);
                
                // Create error object for handleSessionError
                const sessionError = {
                    emsg: errorMsg || "Session expired : Invalid Session Key"
                };
                
                // Handle session error immediately (logout and navigate)
                sessionStore.handleSessionError(sessionError, authStore, appStore);
                
                // Return error to prevent further processing
                return errorData || { stat: 'NotOk', emsg: errorMsg };
            } else {
                // 401 but not session expired or no uid - just show error
                if (errorData && errorData.emsg) {
                    appStore.showSnackbar(2, errorData.emsg);
                } else if (errorMsg) {
                    appStore.showSnackbar(2, errorMsg);
                }
                return errorData || { stat: 'NotOk', emsg: errorMsg };
            }
        }
        
        // if (!response.ok) {
        return response.json();
        // }
    } catch (error) {
        // Check for 401 in catch block as well
        if (error.status === 401) {
            console.error("❌ 401 Unauthorized error detected in makeApiRequest catch block");
            
            const authStore = useAuthStore();
            const sessionStore = useSessionStore();
            const appStore = useAppStore();
            
            // Try to extract error message
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
            
            if (isSessionExpired && authStore.uid) {
                const sessionError = {
                    emsg: errorMsg
                };
                sessionStore.handleSessionError(sessionError, authStore, appStore);
            } else {
                appStore.showSnackbar(2, errorMsg);
            }
        }
        throw new Error(`zebull symbols request error: ${error.status}`);
    }
}