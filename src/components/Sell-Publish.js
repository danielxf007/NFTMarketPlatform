import { useEffect, useState } from "react";
import { giveRights, publishSell } from "../util/interact.js";

const contracts_metadata = require("../contracts/contracts_metadata.json");

const SellPublisher = (props) => {
    const [token_name, setTokenName] = useState("");
    const [price, setPrice] = useState(0);

    useEffect(() => {
    }, [token_name, price]);

    const onGiveRights = async() => {
        const {success, err_message, tx} = await giveRights(token_name, contracts_metadata.shop.address);
        if(success){
            props.socket.emit('made-tx', tx);
        }else{
            alert(err_message);
        }   
    };

    const onPublishPressed = async() => {
        const { success, err_message, tx } = await publishSell(token_name, price);
        if (success){
            props.socket.emit('made-tx', tx);
            setTokenName("");
            setPrice(0);
        }else{
            alert(err_message);
        }    
    };

    return (
        <div className="Sell-Publisher">
            <h1 id="title">Publish Sell</h1>
            <br></br>
            <form>
                <h2>Token Name: </h2>
                <br></br>
                    <input
                    type="text"
                    value={token_name}
                    required
                    onChange={(event) => setTokenName(event.target.value)}
                />
                <h2>Set Up Prize </h2>
                <br></br>
                    <input
                    type="number"
                    step={0.0001}
                    min={0.0}
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                />
                <br></br>
            </form>
            <br></br>
            <button onClick={onGiveRights}>
                Give Rights
            </button>
            <button onClick={onPublishPressed}>
                Publish
            </button>
        </div>
    );
};

export default SellPublisher;