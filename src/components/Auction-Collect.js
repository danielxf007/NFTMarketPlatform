import { useEffect, useState } from "react";

import {
    collectAuction
} from "../util/interact";

const AuctionCollector = (props) => {
    const [token_name, setTokenName] = useState("");

    useEffect(() => {
    }, [token_name]);

    const onCollectPressed = async() => {
        const { success, err_message, tx } = await collectAuction(token_name);
        if(success){
            props.socket.emit('made-tx', tx);
            setTokenName("");
        }else{
            alert(err_message);
        }  
    };

    return (
        <div className="Auction-Collector">
            <h1 id="title">Collect Auction</h1>
            <br></br>
            <form>
                <h2>Token Name: </h2>
                <br></br>
                    <input
                    type="Text"
                    onChange={(event) => setTokenName(event.target.value)}
                    />
            </form>
            <br></br>
            <button onClick={onCollectPressed}>
                Collect
            </button>
        </div>        

    );
};

export default AuctionCollector;