import { useEffect, useState } from "react";

import {
    renewAuction
} from "../util/interact";

const AuctionRenewer = (props) => {
    const [date, setDate] = useState("");
    const [token_name, setTokenName] = useState("");

    useEffect(() => {
    }, [date, token_name]);

    const onRenewPressed = async() => {
        const date_1 = new Date();
        const date_2 = new Date(date);
        if(date_2 - date_1 < 0){
            alert("This date has already expired");
        }else{
            const active_time = parseInt(Math.abs(date_2 - date_1)/1000);
            const { success, tx } = await renewAuction(token_name, String(date), active_time);
            if(success){
                props.socket.emit('made-tx', tx);
                setDate("");
                setTokenName("");
            }
        }
    };
    
    return (
        <div className="Auction-Renewer">
            <h1 id="title">Renew Auction</h1>
            <br></br>
            <form>
                <h2>Token Name: </h2>
                <br></br>
                    <input
                    type="Text"
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
            <button onClick={onRenewPressed}>
                Renew
            </button>
        </div>        

    );   

};

export default AuctionRenewer;