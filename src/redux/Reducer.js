import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {

          rpc: {
            4: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
          
          }
        }
      }
    }

    return providerOptions;
}

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: getProviderOptions() // required
});


const initialState = {
    loading: false,
    address: "",
    connected: false,
    web3: null,
    provider: null,
    pkStaking:null,
    pktoken:null, 
    token: null,
    errorMsg: null,
    reward: null,
    web3Modal
}

const walletConnectReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CONNECTION_REQUEST":
            return {
                ...initialState,
                loading: true,
            };
        case "CONNECTION_SUCCESS":
            return {
                ...state,
                loading: false,
                address: action.payload.address,
                token: action.payload.token,
                pkStaking:action.payload.pkStaking,
                pktoken:action.payload.pktoken,
                reward: action.payload.reward,
                web3: action.payload.web3,
                provider: action.payload.provider,
                connected: action.payload.connected
            };
        case "CONNECTION_FAILED":
            return {
                ...initialState,
                loading: false,
                errorMsg: action.payload,
            };
        case "UPDATE_ADDRESS":
            return {
                ...state,
                address: action.payload.address,
            };
        default:
            return state;
    }
};const networkInitialStatus={

    web3: null,
    provider: null,
    pkStaking:null,
    pktoken: null,
    token: null,
    errorMsg: null,
    reward: null,
    connected: false,

};

export const activeNetwork = (state = networkInitialStatus,action) =>{
  switch(action.type){
   case "NETWORK_CHANGE":
   return{

    address: action.payload.address,
    token: action.payload.token,

    pkStaking:action.payload.pkStaking,
    pktoken:action.payload.pktoken,

    reward: action.payload.reward,
    web3: action.payload.web3,
    provider: action.payload.provider,
    connected: action.payload.connected
   };

 default: 
 return state;

  }


}

export default walletConnectReducer;
  