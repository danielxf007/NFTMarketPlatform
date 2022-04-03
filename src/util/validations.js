require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const contracts_metadata = require("../contracts/contracts_metadata.json");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

export const usedName = async(token_name) => {
    const contract_metadata = contracts_metadata.minter;
    const contract = await new web3.eth.Contract(contract_metadata.abi, contract_metadata.address);
    return contract.methods.usedName(token_name).call();
}