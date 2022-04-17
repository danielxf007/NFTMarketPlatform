import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
} from "../util/interact.js";

const Minter = (props) => {
  const [image_url, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    async function fetchData(){
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    }
  }, []);

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
      <h1>Mint NFTs</h1>
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

