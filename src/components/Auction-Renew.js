import { useState } from "react";

import {
    renewAuction
} from "../util/interact";

const AuctionRenewer = (props) => {
    const [status, setStatus] = useState("");
    const [date, setDate] = useState("");
    const [token_id, setTokenId] = useState(0);

    const onRenewPressed = async() => {
        const date_1 = new Date();
        const date_2 = new Date(date);
        const active_time = parseInt(Math.abs(date_2 - date_1)/1000);
        const { success, status } = await renewAuction(token_id, active_time);
        setStatus(status);
        if(success){
            setDate("");     
            setTokenId(0);
        }
    };
    
    return (
        <div className="AuctionRenewer">
            <h1 id="title">Renew Auction</h1>
            <form>
                <h2>Token ID: </h2>
                    <input
                    type="number"
                    placeholder="0"
                    onChange={(event) => setTokenId(event.target.value)}
                    />
                <h2>Set Up When the Auction Finishes</h2>
                    <input
                        type="datetime-local"
                        onChange={(event) => setDate(event.target.value)}
                    />
            </form>
            <button id="PublishButton" onClick={onRenewPressed}>
                Renew
            </button><br></br>
            <p id="status" style={{ color: "red" }}>
                {status}
            </p>
        </div>        

    );   

};

export default AuctionRenewer;