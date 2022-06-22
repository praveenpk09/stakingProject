import { applyMiddleware, compose, createStore } from "redux";
import { combineReducers } from "redux";
import thunk from "redux-thunk";
import WalletConnect from "./Reducer";

const rootReducer = combineReducers({
  WalletConnect
});

const middleware = [thunk];
const composeEnhancers = compose(applyMiddleware(...middleware));

const configureStore = () => {
  return createStore(rootReducer, composeEnhancers);
};

const store = configureStore();

export default store;
