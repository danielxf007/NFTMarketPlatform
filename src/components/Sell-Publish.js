import { useEffect, useState } from "react";
import { giveRights } from "../util/contract-interactions.js";

const contracts_metadata = require("../contracts/contracts_metadata.json");

const SellPublisher = (props) => {
    const [token_name, setTokenName] = useState("");
    const [price, setPrice] = useState(0);

    useEffect(() => {
    }, [token_name, price]);

    const onGiveRights = async() => {
        const {success, status, tx} = await giveRights(token_name, contracts_metadata.shop.address);
        alert(status);
        if(success){
            props.socket.emit('gave_rights', tx);
        }
    };

    const onPublishPressed = async() => {
        const { success, status, tx } = await publishSell(token_name, price);
        alert(status);
        if (success){
            props.socket.emit('published_sell', tx);
            setTokenName("");
            setPrice(0);
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