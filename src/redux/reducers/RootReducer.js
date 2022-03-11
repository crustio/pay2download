import { combineReducers } from "redux";
import AccountReducer from "./AccountReducer";

const RootReducer = combineReducers({
  account: AccountReducer,
});

export default RootReducer;
