import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from "../util/interact.js";

const Minter = (props) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [image_url, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function fetchData(){
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
    fetchData();
    addWalletListener();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    const { success, tx} = await mintNFT(file, name);
    if(success) {
      props.socket.emit('made-tx', tx);
      setName("");
      setImageURL("");
    }
  };

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <form>
      <h2>Upload Image:</h2>
      <img src={image_url} width="75" height="75"/>
        <input
          type="file"
          multiple accept="image/*"
          onChange={(event) => {
          setFile(event.target.files[0])
          setImageURL(URL.createObjectURL(event.target.files[0]))}}
        />
        <h2>Name: </h2>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </form>
      <br></br>
      <button id="mintButton" onClick={onMintPressed}>
        Mint NFT
      </button>
    </div>
  );
};

export default Minter;

