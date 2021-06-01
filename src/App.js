import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { bid_func: 0, web3: null, 
	    accounts: null, contract: null, 
	    highest_bidder: "", highest_bid:0,
	    withdraw: null, bidder_balance: null, input: "" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const highestbid = await instance.methods.highestBid().call();
      const highestbidder = await instance.methods.highestBidder().call();
      this.setState({highest_bid: highestbid, highest_bidder: highestbidder})
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runbid = async() => {
   const { accounts, contract } = this.state;

   await contract.methods.bid().send({from:accounts[0], value: this.state.bid_func});

   const result = await contract.methods.highestBid().call();

   const res_bidder = await contract.methods.highestBidder().call();

   this.setState({ highest_bid: result, highest_bidder: res_bidder});

  };

  runwithdraw = async () => {
    const { accounts, contract } = this.state;

    await contract.methods.withdraw().send({from: accounts[0]});

    const result = await contract.methods.highestBid().call();

   const res_bidder = await contract.methods.highestBidder().call();

   this.setState({ highest_bid: result, highest_bidder: res_bidder});
   };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Auction Contract</h1>
        <h2>Functions of Auction</h2>
        <p> Enter a bid </p>
	<input 
	 type="text"
	 onChange ={(event) => {this.setState({bid_func:event.target.value})}} />
         <button onClick = {this.runbid}>Bid</button>
        <p>
          The highest bid is: {this.state.highest_bid}</p>
	<p>
	  and the highest bidder is: {this.state.highest_bidder}
        </p>
        <div>Click to withdraw:</div>
	<button onClick = {this.runwithdraw}>Withdraw</button>
      </div>
    );
  }
}

export default App;
