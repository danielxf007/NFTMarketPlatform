import { useState } from "react";

import {
    withdrawBid
} from "../util/interact";

const AuctionBidWithdrawer = (props) => {
    const [status, setStatus] = useState("");
    const [token_id, setTokenId] = useState(0);

    const onWithdrawPressed = async() => {
        const { success, status } = await withdrawBid(token_id);
        setStatus(status);
        if(success){
            setTokenId(0);
        }
    };
    
    return (
        <div className="AuctionBidWithdrawer">
            <h1 id="title">Withdraw Your Bid</h1>
            <form>
                <h2>Token ID: </h2>
                    <input
                    type="number"
                    onChange={(event) => setTokenId(event.target.value)}
                    />
            </form>
            <button id="PublishButton" onClick={onWithdrawPressed}>
                Withdraw
            </button><br></br>
            <p id="status" style={{ color: "red" }}>
                {status}
            </p>
        </div>        

    );
};

export default AuctionBidWithdrawer;