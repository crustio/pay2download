export const SET_ACCOUNT_ADDRESS = "SET_ACCOUNT_ADDRESS";
export const SET_ACCOUNT_SIGNATURE = "SET_ACCOUNT_SIGNATURE";
export const SET_IS_LOGGED_IN = "SET_IS_LOGGED_IN";
export const SET_IS_LOADING = "SET_IS_LOADING";
export const SET_PRIVATE_KEY = "SET_PRIVATE_KEY";

export function setAccountAddress(address) {
    return dispatch => {
        dispatch({
            type: SET_ACCOUNT_ADDRESS,
            address: address
        });
    };
}

export function setAccountSignature(signature) {
    return dispatch => {
        dispatch({
            type: SET_ACCOUNT_SIGNATURE,
            signature: signature
        });
    };
}

export function setIsLoggedIn(isLoggedIn) {
    return dispatch => {
        dispatch({
            type: SET_IS_LOGGED_IN,
            isLoggedIn: isLoggedIn
        });
    };
}

export function setIsLoading(isLoading) {
    return dispatch => {
        dispatch({
            type: SET_IS_LOADING,
            isLoading: isLoading
        });
    };
}

export function setGlobalPrivateKey(globalPrivateKey) {
    return dispatch => {
        dispatch({
            type: SET_PRIVATE_KEY,
            globalPrivateKey: globalPrivateKey
        });
    };
}