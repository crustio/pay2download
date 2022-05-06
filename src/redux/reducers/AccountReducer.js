import {
    SET_ACCOUNT_ADDRESS, SET_ACCOUNT_SIGNATURE, SET_IS_LOGGED_IN, SET_IS_LOADING, SET_PRIVATE_KEY,
} from "../actions/AccountActions";

const initialState = {
    address: [],
    signature: null,
    isLoggedIn: true,
    isLoading: false,
    globalPrivateKey: null,
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
        case SET_IS_LOADING: {
            return {
                ...state,
                isLoading: action.isLoading
            }
        }
        case SET_PRIVATE_KEY: {
            return {
                ...state,
                globalPrivateKey: action.globalPrivateKey
            }
        }
        default: {
            return state;
        }
    }
}

export default AccountReducer;