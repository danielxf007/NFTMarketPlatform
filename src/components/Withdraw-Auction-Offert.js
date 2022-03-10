import { useEffect, useState } from "react";

import {
    getAuctionReturn
} from "../util/contract-interactions";

const AuctionWithdrawer = (props) => {
    const [status, setStatus] = useState("");
    const [token_id, setTokenId] = useState(0);

    useEffect(() => {
    }, []);

    const onWithdrawPressed = async() => {
        const { success, status } = await getAuctionReturn(token_id);
        setStatus(status);
        if (success) {
            setTokenId(0);
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

export default AuctionWithdrawer;