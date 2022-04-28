import {
    SET_ACCOUNT_ADDRESS, SET_ACCOUNT_SIGNATURE, SET_IS_LOGGED_IN,
} from "../actions/AccountActions";

const initialState = {
    address: [],
    signature: null,
    isLoggedIn: true,
};

const AccountReducer = function(state = initialState, action) {
    switch (action.type) {
        case SET_ACCOUNT_ADDRESS: {
            return {
                ...state,
                address: action.address
            };
        }
        case SET_ACCOUNT_SIGNATURE: {
            return {
                ...state,
                signature: action.signature
            }
        }
        case SET_IS_LOGGED_IN: {
            return {
                ...state,
                isLoggedIn: action.isLoggedIn
            }
        }
        default: {
            return state;
        }
    }
}

export default AccountReducer;