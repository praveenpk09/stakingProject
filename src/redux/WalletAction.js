import React from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import store from "./store";
import Pktoken from "../contracts/pktoken.json"
import PkStaking from "../contracts/pkstaking.json"

const activeNetwork = (payload) => {
  return {
    type: "NETWORK_CHANGE",
    payload: payload,
  };
};

const currentchainid = 4

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

export const disconnectRequest = () => {
  return {
    type: "DISCONNECT"
  };
}


export const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

export const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

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
    },
  }
  return providerOptions;
}

export const connectWallet = () => {
    return async(dispatch) =>  {
      
        dispatch(connectRequest());
        try {
            const web3Modal = new Web3Modal({
                cacheProvider: true,
                providerOptions: getProviderOptions() // required
            });
    
            const provider = await web3Modal.connect();
            const TokenContractAddress = '0x8513b037e0817d8FEF9C00bbC16278645aC353cB';
            const StakingContractAddress='0x00540ff67510F4655b3f5F846833d4DDFc95A7Bf';
    
            await subscribeProvider(provider,dispatch);
            
            const web3 = new Web3(provider);

            const account =await web3.eth.getAccounts();
            const address = account[0];
            const pkStaking=new web3.eth.Contract(PkStaking,StakingContractAddress);
            const pktoken=new web3.eth.Contract(Pktoken,TokenContractAddress);
            const networkId=await web3.eth.net.getId();
            console.log('add',address);
            console.log('pk',pkStaking)
            console.log('tok',pktoken);
            console.log('net',networkId);
            web3.eth.extend({
                methods: [

                  {
                     name:"chainId",
                     call: "eth_chainId",
                     outputFormatter: web3.utils.hexToNumber
                  }
                ]
            });
        
       
         
            if(window.ethereum && window.ethereum.networkVersion !== currentchainid ) {
              await addNetwork(currentchainid);
            }
           


  dispatch(
    connectSuccess({
        address,
        web3,
        pkStaking,
        pktoken,
        provider,
        connected: true,
        web3Modal
    })
);
dispatch(
  activeNetwork({
    address,
    web3,
    pkStaking,
    pktoken,
    provider,
    connected:true,
    web3Modal
  })
);
    
        } catch (e) {
            dispatch(connectFailed(e));
        }
    }
    
}
export const disconnect = () => {
  return async(dispatch)=> {
    const { web3Modal } = store.getState().walletConnect;
  
    web3Modal.clearCachedProvider();
    dispatch(disconnectRequest());
  }
}
const subscribeProvider = async(provider) => {
    if (!provider.on) {
      return;
    }

    provider.on('connect', async(id) => {
      
    });

    provider.on("networkChanged", async (networkId) => {
      if(networkId !== currentchainid) {
       
        store.dispatch(connectFailed('Please switch to ETH Mainnet'));
      } else {
      
      }
    });

}

export async function addNetwork(id) {
  //alert(typeof id)
  let networkData;
  switch (parseInt(id)) {
      case 4:
        networkData = [
          {
            chainId: '0x4'
          }
        ]
        break;
      case 1:
        networkData = [
          {
            chainId: '0x1'
          }
        ]
        break;
    default:
      break;
  }
  if(id!=currentchainid)
  {
    return window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: networkData,
      });
  }
  else
  {
    return window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: networkData,
      });
  }
}



