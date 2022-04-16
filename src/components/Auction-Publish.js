import { useEffect, useState } from "react";

import {
    giveRights, publishAuction
} from "../util/interact";

const contracts_metadata = require("../contracts/contracts_metadata.json");

const AuctionCreator = (props) => {
    const [date, setDate] = useState("");
    const [token_name, setTokenName] = useState("");

    useEffect(() => {
    }, [date, token_name]);

    const onGiveRights = async() => {
        const {success, status, tx} = await giveRights(token_name, contracts_metadata.auction.address);
        alert(status);
    };

    const onPublishPressed = async() => {
        const date_1 = new Date();
        const date_2 = new Date(date);
        if(date_2 - date_1 < 0){
            alert("This date has already expired");
        }else{
            const active_time = parseInt(Math.abs(date_2 - date_1)/1000);
            const { success, status, tx } = await publishAuction(token_name, String(date), active_time);
            alert(status);
            if(success){
                setDate("");
                setTokenName("");
            }       
        }
    };
    
    return (
        <div className="Auction-Publisher">
            <h1 id="title">NFT AUCTION CREATION</h1>
            <br></br>
            <form>
                <h2>Token Name:</h2>
                <br></br>
                    <input
                    type="Text"
                    value={token_name}
                    onChange={(event) => setTokenName(event.target.value)}
                    />
                <h2>Set Up When the Auction Finishes</h2>
                <br></br>
                    <input
                        type="datetime-local"
                        onChange={(event) => setDate(event.target.value)}
                    />
            </form>
            <br></br>
            <button onClick={onGiveRights}>
                Give Rights
            </button>
            <button onClick={onPublishPressed}>
                Publish
            </button><br></br>
        </div>        

    );
}

export default AuctionCreator;