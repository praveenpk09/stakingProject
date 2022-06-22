import React from 'react'
import './app.css';
import logo1 from '../images/content.png';
import { connectWallet, connectFailed } from "../redux/WalletAction";

import Modal from './modal/modal'
import bit from '../images/bit.png';
import copy from '../images/copy.png'

// import { Slider, RangeSlider } from 'rsuite';
import "rc-slider/assets/index.css";
import Slider, { createSliderWithTooltip } from "rc-slider";

import { useSelector } from "react-redux";


import { useState, useEffect } from 'react';
import axios from 'axios';






const Home = () => {



  const wallet = useSelector((state) => state.WalletConnect);
  const [value, setValue] = useState(0);
  const [lists, setlists] = useState([])
  const [days, setDays] = useState(0);
  const [APR1, setAPR1] = useState(0);
  const [currestimatedreward, setCurrestimatedreward] = useState(0);
  const [stakeUsdtValue, setStakeUsdValue] = useState(0);
  const [price, setPrice] = useState();
  const [rewardUsdtValue, setRewardUsdtValue] = useState(0);
  const [amount1, setamount1] = useState(0);
  const [rewardUsdtValue1, setRewardUsdtValue1] = useState(0);
  const [currentAPR, setCurrentAPR] = useState(0);
  const [approved, setApproved] = useState(false);
  const [gridData, setGridData] = useState([]);
  const [totaltoken, settotaltoken] = useState(100000000)
  const [stakeRecords, setStakeRecords] = useState([])
  const [allowance, setAllowance] = useState(0);
  const [model, setModel] = useState(false);
  console.log('price', price)






  const approval = async () => {
    const { address, pktoken, web3 } = wallet;
    console.log("web3", web3)
    console.log("p", pktoken)
    const tokenAmount = web3.utils.toWei('99999999', 'ether');
    const StakingContractAddress = '0x00540ff67510F4655b3f5F846833d4DDFc95A7Bf';
    const approval = await pktoken.methods.approve(StakingContractAddress, tokenAmount).send({
      from: address
    })
    console.log('approval', approval);

    setApproved(true)
    console.log("approve")
  }
  const checkAllowance = async () => {
    const { web3, pktoken, address } = wallet;
    const stakingContractAddress = '0x00540ff67510F4655b3f5F846833d4DDFc95A7Bf';
    console.log('adddd', address)
    const allowance = await pktoken.methods.allowance(address, stakingContractAddress).call();
    console.log('allow', allowance);
    const allowanceFromWei = parseInt(web3.utils.fromWei(allowance, 'ether'));
    console.log('fromWeri', allowanceFromWei);

    setAllowance(allowanceFromWei)

    if (allowanceFromWei > 0) {
      console.log('to be approved!')
      setApproved(true);
    } else {
      console.log('approved');
      setApproved(false);
    }

  }
  // useEffect(()=>{
  // getStakeRecords();
  // },[])

  const getStakeRecords = async () => {
    const { web3, pkStaking, address } = wallet;
    console.log('stak', pkStaking)
    const totalStakeRecord = await pkStaking.methods.totalStakeRecords(address).call();
    const stakersPromises = [];
    for (let i = 0; i < totalStakeRecord; i++) {
      stakersPromises.push(pkStaking.methods.stakers(address, i).call());
    }
    let array = []
    Promise.all(stakersPromises).then(async (res) => {
      await Promise.all(res.map(async (data, i) => {
        console.log('i', i);
        data.balance = web3.utils.fromWei(data.balance, 'ether');
        let earningperstak = await pkStaking.methods.earned(address, i).call();
        console.log('earn', earningperstak);
        data.rewardEarned = web3.utils.fromWei(earningperstak, 'ether').slice(0, 5);
        console.log('reea', data.rewardEarned);
        data.apr = web3.utils.fromWei(data.apr, "")
        const time = Math.floor(Math.floor(data.maxtime - (Date.now() / 1000)) / (60));
        data.timeleft = time < -1 ? -1 : time;
        console.log('data', data);
        array.push(data);
        console.log('array', array);

      }));
      setGridData(array)
      if (res.length > 0) {
        setStakeRecords(res);
      }

    })

  }
  const stakePk = async () => {

    if (value > 0 && days > 0 && value <= 3000000 && days <= 365) {

      const { web3, pkStaking, address } = wallet;
      console.log("s", pkStaking)
      const tokenAmount = web3.utils.toWei(value.toString(), 'ether');
      const stake = await pkStaking.methods.stakeTok(tokenAmount, days).send({ from: address });
      await getStakeRecords();
      setModel(true);
      console.log('model', setModel)
    } else {
      alert('amount of Pk or days should be more than 0')


    }
  }



  const unstake = async (record) => {
    const { pkStaking, address } = wallet;
    const instance = pkStaking;
    console.log('insta', instance)
    if (isTimeEnded(record, instance)) {
      const exit = await instance.methods.exit(record).send({ from: address });
    } else {
      const unstak = await instance.methods.unstake(record).send({ from: address });
    }
    await getStakeRecords();

  }
  const isTimeEnded = async (record, instance) => {
    const { address } = wallet;
    const stakerDetails = await instance.methods.stakers(address, record).call();
    console.log("det", stakerDetails);
    if (parseInt(stakerDetails.maxtime) <= Math.ceil(Date.now() / 1000)) {
      console.log('parse', stakerDetails.maxtime)
      console.log("parse2", Math.ceil(Date.now() / 1000))
      return true;
    }
    return false;
  }
  const canUnstake = (data) => {
    console.log('time', data.maxtime);
    return !(data.maxtime < (Date.now() / 1000));
  }
  const cangetReward = (data) => {
    console.log('rewards', data.rewardEarned)
    return (data.rewardEarned == 0)
  }
  const claimReward = async (record) => {
    const { address, pkStaking } = wallet;
    const instance = pkStaking;
    if (await isTimeEnded(record, instance)) {
      const exit = await instance.methods.getReward(record).send({ from: address });
      console.log('exit', exit)

    } else {
      const claimReward = await instance.methods.getReward(record).send({ from: address });
      console.log('reward', claimReward)
    }
    await getStakeRecords();
  }



  const userdetails = async () => {
    const { connected } = wallet;
    if (!connected) {
      await connectWallet();
      await connectFailed();
    }
  }
  useEffect(() => {
    userdetails()
    if (wallet.connected) {
      if (!(lists.length > 0)) {
        fetchTransactionHistory()
        getStakeRecords();
        checkAllowance()
      }
    }
  }, [wallet.connected])

  function handleChange(e) {
    calculateReward(e.target.value);
  }
  function handleDays(e) {
    if (days < 0) {
      alert('give a day ')
      return false;
    }
    calculateAPR(e.target.value);
  }
  useEffect(() => {
    let currentAPR = calculateAPR(days);
    setCurrentAPR(currentAPR);
  })
  const getPrices = async () => {
    const result = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=lockness&vs_currencies=usd');
    console.log(result);
    const data = result.data.lockness.usd;
    setPrice(data);
  }
  useEffect(() => {
    getPrices();
    transactioninfo();
  }, [wallet.connected])
  useEffect(() => {
    let currentAPR = calculateAPR(days);
    setCurrentAPR(currentAPR);


    if (wallet.connected !== false) {
      console.log('in promise call back');
      getStakeRecords();
      checkAllowance();
    }
  },
    [wallet.connected == true])
  const timeconvert = (unix_timestamp) => {

    var date = new Date(unix_timestamp * 1000);
    console.log(date)
    return date;


  }

  const transactioninfo = async () => {
    const { address, web3 } = wallet;



    const res = await axios.get('https://api-rinkeby.etherscan.io/api', {
      params: {
        module: 'logs',
        action: 'getLogs',
        address: '0x00540ff67510f4655b3f5f846833d4ddfc95a7bf',
        topic0: '0x0f5bb82176feb1b5e747e28471aa92156a04d9f3ab9f45f28e2d704232b93f75',
        apiKey: '2GK5EHDSYE1QAMI9HD86IIZU72XD2YIYFR',
      }

    });
    console.log('res', res.data.result)
    return res.data.result;
    // var result = res.data.result;
    //console.log("result",result);
  }
  // const trans=res.data.result;
  const fetchTransactionHistory = async () => {

    const { address, web3 } = wallet;
    const transactionHistory = [];
    transactioninfo().then(async (resultArray) => {
      console.log("resultArray", resultArray);

      const reversedList = resultArray.map((e, i, a) => a[(a.length - 1) - i])
      console.log("datassforreverslist", reversedList)
      await Promise.all(reversedList.map(async (event, i) => {
        const valuee = event.topics[1]

        console.log('userr', valuee);
        // console.log('valuee',valuee)
        // console.log('web3',web3)
        const returnAddress = web3.utils.toChecksumAddress('0x' + valuee.slice(-40));
        console.log("returnaddress", returnAddress)
        const transactionHash = event.transactionHash;
        const amount = parseFloat(web3.utils.fromWei(web3.utils.hexToNumberString(event.data), 'ether')).toFixed(2);
        console.log("am", amount);
        const timess = parseInt(event.timeStamp, 16) * 1000;


        var time = (String(new Date(timess))).slice(4, 25);

        // 
        const indexx = i;
        console.log('indexx', indexx);
        const transaction = { transactionHash, amount, time, indexx, returnAddress };
        if (address == returnAddress) {
          transactionHistory.push(transaction);
          // 
        }
      }));

      var resultData = transactionHistory;
      setlists(resultData);
      console.log("res", resultData)

    });
  }



  const calculateAPR = (days) => {
    setDays(days);
    let APR1 = (days * 0.002) + 50;//(amount *30/100)365
    setAPR1(APR1.toFixed(2));
    calculateReward(value);
    console.log('reward'.calculateReward)
  }
  const calculateReward = (amount) => {
    setValue(amount);
    console.log("amount", amount);
    let amount1 = (amount * APR1) / 100;
    console.log("amount1", amount1)
    setamount1(amount1.toFixed(2));

    let stakeUsdtValue = (value * price).toFixed(2);
    setStakeUsdValue(stakeUsdtValue);

    let rewardUsdtValue1 = (amount1 * price).toFixed(2);
    setRewardUsdtValue1(rewardUsdtValue1);

    let currestimatedreward = ((amount1 / 365) * days);
    currestimatedreward = (Math.floor(currestimatedreward));
    setCurrestimatedreward(currestimatedreward)
    setRewardUsdtValue(currestimatedreward * price)
    console.log("cur", currestimatedreward);


  }
  function alertt() {
    alert("click the Approve button")
  }



  return (
    <div>


      <div className='container-fluid'>


        <hr />
        <div className='row'>
          <div className='col-md-1'></div>
          <div className='col-md-4 hover'>
            <img src={logo1} className='imgg' />
          </div>
          <div className='col-md-6'>

            <div className='row border-11 anyClass'>
              <div className='col-md-12'><h4>PK Bounty</h4></div>

              {gridData.map((data, i) => {
                if (data.balance !== '0') {

                  return (
                    <>
                      {model && (<Modal title={<span className='color'>Welcome to Crypto Staking</span>} content={<h2 className='color color1'>Thanks for staking {data.balance} PK Token!</h2>} close={setModel}
                      />)}

                      <div className='col-md-5 pad'>

                        <div className='total mb pl'>
                          <h6 className=''>Total Stake</h6><h6 className='pl '>{data.balance} PK</h6>....<h6 className='pl'>{(data.apr * totaltoken).toFixed(2)}%</h6>

                        </div>
                        <button className='mt button-2 bot' key={i} style={{ backgroundColor: !canUnstake(data) ? '#fff94f' : '#5b5c24' }} disabled={canUnstake(data)} onClick={() => unstake(i, false)}>Stake amount</button>
                      </div>
                      <div className='col-md-1 vl'></div>
                      <div className='col-md-5 mt1'>
                        <p className='apy_month' style={{ color: "white" }}> <b>{data['3']} Days</b> &nbsp;&nbsp;<span> ({data.timeleft + 1}) </span> Left </p>

                        <div className='total mb'>

                          <img src={bit} width='25px' height='25px' className='bit'></img><h6>{data.rewardEarned}</h6><span className='pl ml'>Rewards received</span>
                        </div>

                        <button className='mt button-3' key={i} style={{ backgroundColor: !cangetReward(data) ? '#fff94f' : '#5b5c24' }} disabled={cangetReward(data)} onClick={() => claimReward(i, true)}>Collect reward</button>
                      </div>
                      <div className='col-md-11 hr2'></div>
                    </>
                  )

                }
              })}
            </div>

            <div className='row border-1 mt'>
              <div className='col-md-12'><h4>Select your rewards</h4></div>

              <div className='col-md-3'>


                <p className='font'>Your estimated rewards </p>
                <span className='total1 mb1 font1'><p className='fontcolor'>{currestimatedreward}</p><p className='fontcolor'>PK</p><p className='fontcolor'>{rewardUsdtValue1}</p><p className='fontcolor'>USD</p></span>
                <p className='font '>Current APY</p>
                <p className='font1 fontcolor'>{APR1}</p>

              </div>
              <div className='col-md-1 vl1'></div>
              <div className='col-md-8'>
                <span className='total2 '><p className='fontcol'>Your Stake</p><h5>Token<input className='input ' type='text'
                  value={value} min='50'

                  max={30000000} onChange={(e) => handleChange(e)}></input>PK</h5><h5>{stakeUsdtValue} USD</h5></span>
                <Slider className='mt2'
                  min={0}
                  max={30000000}
                  value={value}
                  onChange={(value) => { calculateReward(value); }}
                  railStyle={{
                    height: 4,
                    width: 400,
                    left: 20
                  }}
                  handleStyle={{
                    height: 20,
                    width: 20,
                    marginLeft: 10,
                    marginTop: -10,
                    backgroundColor: "#8d3bff",
                    border: 10
                  }}
                  trackStyle={{
                    background: "#c69dff"
                  }} />
                <span className='total2 mt1'><p className='fontcol'>Your days</p><h5><input className='input' type='text' min='0'
                  max='365'
                  value={days} onChange={(e) => handleDays(e)}></input>Days</h5></span>
                <Slider className='mt2'
                  min={0}
                  max={365}
                  value={days}
                  onChange={(days) => { calculateAPR(days); }}
                  railStyle={{
                    height: 4,
                    width: 400,
                    left: 20
                  }}
                  handleStyle={{
                    height: 20,
                    width: 20,
                    marginLeft: 10,
                    marginTop: -10,
                    backgroundColor: "#8d3bff",
                    border: 10
                  }}
                  trackStyle={{
                    background: "#c69dff"
                  }} />
                <div className='total1'>
                  {!approved && <button className='button4 ' onClick={() => wallet.connected ? approval() : alert('Connect to wallet')}>Approve Stake</button>}
                  <button className='button4 marleft2' style={{ backgroundColor: !approved ? '#5b5c24' : '#9432f4' }} disabled={!approved} onClick={() => approved ? stakePk() : alert("approve tokens before staking")}>stake Reward</button>
                </div>

              </div>
            </div>

          </div>
          <div className='col-md-1'></div>
          {/* <div className='col-md-12 bor'>
          <i class="fa-thin fa-arrow-up-arrow-down"></i>
          <h4>Transaction history</h4>
        </div>
        
        <div className='col-md-1 padleft'>
          <p>No</p>
        </div>
        <div className='col-md-3 padleft1'>
          <p>hash</p>
        </div>
        <div className='col-md-2 padleft1'>
          <p>wallet</p>
        </div>
        <div className='col-md-2 padright'>
          <p>PK Token</p>
        </div> */}
          <div className='col-md-12 bor'>
            <i class="fa-thin fa-arrow-up-arrow-down"></i>
            <h4>Transaction history</h4>
          </div>


          <div className='col-md-12' >
            <div className=' row'>
              <div className='col-md-1'></div>
              <div className='col-md-1'>
                <p>No</p>
              </div>
              <div className='col-md-3'>
                <p>hash</p>
              </div>
              <div className='col-md-2 padleft1'>
                <p>wallet</p>
              </div>
              <div className='col-md-2 padright'>
                <p>PK Token</p>
              </div>

              <div className='col-md-3 padright'>
                <p>Transaction date</p>
              </div>
            </div>
          </div>








          {/* <div className='col-md-4'>
          <p>Transaction date</p>
        </div> */}
          
          <div className='col-md-12 anyClass1'>

            {lists.map((data) => {
              const link = `https://rinkeby.etherscan.io/tx/${data.transactionHash}`;
              return (
                <div className=' row border-11 pdt align-items-center'>
                  {/* <div className='col-md-1'></div> */}

                  <div className='col-md-1'>
                    <p>{data.indexx}</p>
                  </div>
                  <div className='col-md-3'>
                    <a href={link} target='_blank'>{data.transactionHash.slice(0, 5)}.....{data.transactionHash.slice(-5)}</a>
                  </div>
                  <div className='col-md-2'>
                    <p>{data.returnAddress.slice(0, 5)}....{data.returnAddress.slice(-5)}</p>
                  </div>
                  <div className='col-md-2'>
                    <p>{data.amount}</p>
                  </div>

                  <div className='col-md-4'>
                    <p>{data.time}</p>
                  </div>
                </div>

              )
            })}

          </div>
          <div className='col-md-1'></div>
          <div className='col-md-12'>
            <img src={copy} width='50px' height='50px' />
          </div>
        </div>



      </div>
    </div>

  )
}

export default Home