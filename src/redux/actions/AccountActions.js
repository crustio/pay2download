export const SET_ACCOUNT_ADDRESS = "SET_ACCOUNT_ADDRESS";

export function setAccountAddress(address) {
    return dispatch => {
        dispatch({
            type: SET_ACCOUNT_ADDRESS,
            address: address
        });
    };
}