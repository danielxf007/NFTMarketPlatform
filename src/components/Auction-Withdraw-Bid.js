import { useEffect, useState } from "react";

import {
    withdrawBid
} from "../util/interact";

const AuctionBidWithdrawer = (props) => {
    const [token_name, setTokenName] = useState("");

    useEffect(() => {
    }, [token_name]);

    const onWithdrawPressed = async() => {
        const { success, tx} = await withdrawBid(token_name);
        if(success){
            props.socket.emit('made-tx', tx);
            setTokenName("");
        }
    };
    
    return (
        <div className="Bid-Withdrawer">
            <h1 id="title">Withdraw Your Bid</h1>
            <br></br>
            <form>
                <h2>Token Name </h2>
                <br></br>
                    <input
                    type="Text"
                    onChange={(event) => setTokenName(event.target.value)}
                    />
            </form>
            <br></br>
            <button onClick={onWithdrawPressed}>
                Withdraw
            </button>
        </div>        

    );
};

export default AuctionBidWithdrawer;