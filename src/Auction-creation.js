import { useEffect, useState } from "react";
import {
    publishOnMarket
  } from "./util/interact.js";

const Auction_creator = (props) => {
    const [status, setStatus] = useState("");
    const [token_uri, setTokenUri] = useState("");
    const [token_id, setTokenId] = useState(0);
    const [price, setPrice] = useState(0);

    const onPublishPressed = async() => {
        const { success, status } = await publishOnMarket(token_uri, token_id, price);
        setStatus(status);
        if (success) {
            setTokenUri("");
            setTokenId(0);
            setPrice(0);
        }        
    };

    return (
        <div className="AuctionCreator">
            <h1 id="title">NFT AUCTION CREATION</h1>
            <form>
                <h2>Token URI: </h2>
                    <input
                    type="text"
                    placeholder=""
                    onChange={(event) => setTokenUri(event.target.value)}
                />
                <h2>Token ID: </h2>
                    <input
                    type="number"
                    placeholder="0"
                    onChange={(event) => setTokenId(event.target.value)}
                />
                <h2>Set Up Prize </h2>
                    <input
                    type="number"
                    onChange={(event) => setPrice(event.target.value)}
                />
            </form>
            <button id="PublishButton" onClick={onPublishPressed}>
                Publish
            </button><br></br>
            <p id="status" style={{ color: "red" }}>
                {status}
            </p>
        </div>
    );
};

export default Auction_creator;