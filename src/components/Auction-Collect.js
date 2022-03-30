import { useState } from "react";

import {
    collectAuction
} from "../util/interact";

const AuctionCollector = (props) => {
    const [status, setStatus] = useState("");
    const [token_id, setTokenId] = useState(0);

    const onCollectPressed = async() => {
        const { success, status } = await collectAuction(token_id);
        setStatus(status);
        if(success){
            setTokenId(0);
        }
    };
    
    return (
        <div className="Auction-Collector">
            <h1 id="title">Collect Auction</h1>
            <br></br>
            <form>
                <h2>Token ID: </h2>
                <br></br>
                    <input
                    type="number"
                    onChange={(event) => setTokenId(event.target.value)}
                    />
            </form>
            <br></br>
            <button id="PublishButton" onClick={onCollectPressed}>
                Collect
            </button><br></br>
            <p id="status" style={{ color: "red" }}>
                {status}
            </p>
        </div>        

    );
};

export default AuctionCollector;