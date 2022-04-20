import {
    SET_ACCOUNT_ADDRESS, SET_ACCOUNT_SIGNATURE,
} from "../actions/AccountActions";

const initialState = {
    address: [],
    signature: null
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
        default: {
            return state;
        }
    }
}

export default AccountReducer;