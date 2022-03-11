import {
    SET_ACCOUNT_ADDRESS,
} from "../actions/AccountActions";

const initialState = {
    address: [],
};

const AccountReducer = function(state = initialState, action) {
    switch (action.type) {
        case SET_ACCOUNT_ADDRESS: {
            return {
                ...state,
                address: action.address
            };
        }
        default: {
            return state;
        }
    }
}

export default AccountReducer;