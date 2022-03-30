import { useEffect, useState } from "react";

import {
    publishAuction
} from "../util/interact";

import { giveRights } from "../util/contract-interactions.js";

const contracts_metadata = require("../contracts/contracts_metadata.json");

const AuctionCreator = (props) => {
    const [date, setDate] = useState("");
    const [token_name, setTokenName] = useState("");

    useEffect(() => {
    }, [token_name, date]);

    const onGiveRights = async() => {
        const success = await giveRights(token_name, contracts_metadata.auction.address);
        if(success){
            alert("Wait until your transactions is confirmed");
        }
    };

    const onPublishPressed = async() => {
        const date_1 = new Date();
        const date_2 = new Date(date);
        if(date_2 - date_1 < 0){
            alert("This date has already expired");
        }else{
            const active_time = parseInt(Math.abs(date_2 - date_1)/1000);
            const { success, status } = await publishAuction(token_name, date, active_time);
            if(success){
                setDate("");     
                setTokenName("");
                alert(status);
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
                    required
                    onChange={(event) => setTokenName(event.target.value)}
                    />
                <h2>Set Up When the Auction Finishes</h2>
                <br></br>
                    <input
                        type="datetime-local"
                        required
                        onChange={(event) => setDate(event.target.value)}
                    />
            </form>
            <br></br>
            <button onClick={onGiveRights}>
                Give Rights
            </button>
            <button id="PublishButton" onClick={onPublishPressed}>
                Publish
            </button><br></br>
        </div>        

    );
}

export default AuctionCreator;