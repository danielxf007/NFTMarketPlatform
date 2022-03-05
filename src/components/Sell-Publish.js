import { useEffect, useState } from "react";
import {
    publishSell
  } from "../util/interact.js";

const SellPublisher = (props) => {
    const [status, setStatus] = useState("");
    const [token_id, setTokenId] = useState(0);
    const [price, setPrice] = useState(0);

    useEffect(() => {
    }, []);

    const onPublishPressed = async() => {
        const { success, status } = await publishSell(token_id, price);
        setStatus(status);
        if (success) {
            setTokenId(0);
            setPrice(0);
        }        
    };

    return (
        <div className="AuctionCreator">
            <h1 id="title">NFT AUCTION CREATION</h1>
            <form>
                <h2>Token ID: </h2>
                    <input
                    type="number"
                    value={token_id}
                    onChange={(event) => setTokenId(event.target.value)}
                />
                <h2>Set Up Prize </h2>
                    <input
                    type="number"
                    step={0.0001}
                    min={0.0}
                    value={price}
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

export default SellPublisher;