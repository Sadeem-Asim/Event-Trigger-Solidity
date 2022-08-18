import React from "react";
import { EthProvider } from "./contexts/EthContext";
import Web3 from "web3";
import "./App.css";
import ItemManager from "./contracts/ItemManager.json";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
      identifier: "",
      priceInWei: "",
      itemsToBePaid: [],
      itemsToBeDelivered: [],
      walletConnect: "Connect Wallet",
    };
  }
  componentDidMount = async () => {
    try {
      this.web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
      this.accounts = await this.web3.eth.requestAccounts();
      this.setState({
        walletConnect: `Connected : ${this.accounts[0].substring(0, 8)}...`,
      });
      const networkID = await this.web3.eth.net.getId();
      const address = ItemManager.networks[networkID].address;
      this.contract = new this.web3.eth.Contract(ItemManager.abi, address);
      this.contract.events.SupplyChainStep().on("data", async function (evt) {
        console.log(evt);
      });
    } catch (err) {
      console.log(err);
    }
    await this.onChange();
    this.setState({ loaded: true });
  };

  onChange = async () => {
    let itemsToBePaid = [];
    let itemsToBeDelivered = [];
    let totalItems = await this.contract.methods.itemIndex.call().call();
    for (var i = 0; i < totalItems; i++) {
      let result1 = await this.contract.methods.items(i).call();
      result1.index = i;
      if (result1.state === "0") {
        itemsToBePaid.push(result1);
      } else if (result1.state === "1") {
        itemsToBeDelivered.push(result1);
      }
    }
    this.setState({ itemsToBePaid });
    this.setState({ itemsToBeDelivered });
  };

  purchaseItem = async (item) => {
    try {
      this.web3.eth
        .sendTransaction({
          from: this.accounts[0],
          to: item.item,
          value: item.itemPrice,
        })
        .then(function () {
          window.location.reload();
          this.setState({ loaded: false });
        });
      await this.onChange();
      this.setState({ loaded: true });
    } catch (err) {
      console.log("Error : ", err);
    }
  };
  deliverItem = async (item) => {
    this.contract.methods
      .triggerDelievery(item.index)
      .send({ from: this.accounts[0] })
      .on("receipt", () => {
        window.location.reload();
        this.setState({ loaded: false });
      });
    this.setState({ loaded: true });
  };
  handleSubmit = async (event) => {
    const { identifier, priceInWei } = this.state;
    if (identifier === "" || priceInWei === "") {
      return alert("Please Fill Up The Both Fields");
    }
    event.preventDefault();
    this.contract.methods
      .createItem(identifier, priceInWei)
      .send({ from: this.accounts[0] })
      .on("receipt", () => {
        this.setState({ loaded: false });

        window.location.reload();
      });
    this.setState({ loaded: true });
  };

  handleChange = (event) => {
    const { value, name } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { itemsToBePaid } = this.state;
    const { itemsToBeDelivered } = this.state;
    const { walletConnect } = this.state;
    if (this.state.loaded === false) {
      return (
        <div class="loader-container">
          <div class="loader"></div>
        </div>
      );
    }

    return (
      <EthProvider>
        <div className="header">
          <h1>Event Trigger / Supply Chain Example</h1>
          <p className="wallet item">{walletConnect}</p>
        </div>
        <div id="App">
          <h2>Add Item (Only Owner)</h2>

          <form>
            <label>Item Name</label>
            <input
              type="text"
              name="identifier"
              value={this.state.identifier}
              onChange={this.handleChange}
              placeholder="Name"
              required
            />
            <label>Price In Wei</label>
            <input
              type="number"
              name="priceInWei"
              value={this.state.priceInWei}
              onChange={this.handleChange}
              required
              placeholder="Price"
            />
            <button type="submit" onClick={this.handleSubmit}>
              Add Item
            </button>
          </form>
        </div>
        <div className="items-paid">
          <h1>All Items To Be Paid(Click To Pay)</h1>
          <div className="items">
            {itemsToBePaid.map((item, idx) => (
              <h1
                key={idx}
                onClick={() => this.purchaseItem(item)}
                className="item"
              >
                Name : {item.identifier} , Price : {item.itemPrice} Wei
              </h1>
            ))}
          </div>
        </div>
        <div className="items-deliver">
          <h1 className="title">All Items To Be Delivered(Click To Deliver)</h1>
          <div className="items">
            {itemsToBeDelivered.map((item, idx) => (
              <h1
                key={idx}
                onClick={() => this.deliverItem(item)}
                className="item"
              >
                Name : {item.identifier}
              </h1>
            ))}
          </div>
        </div>
        <div className="footer">
          <h4>
            (My First BlockChain Project) Made In Solidity💲React❤️Truffle🦃&
            Ganache💯
          </h4>
        </div>
      </EthProvider>
    );
  }
}

export default App;
