import React, { useEffect, useRef, useState } from "react";
import ItemList from "./projectList";
import NewItem from "./newProject";
import {
  ScryptProvider,
  PandaSigner,
  Scrypt,
  ContractCalledEvent,
  toByteString,
  MethodCallOptions,
  hash160,
  Addr,
  bsv,
} from "scrypt-ts";
import { Item, Tipbsv } from "./contracts/tipbsv";
import { AddTask, Done, Home, Info, Wallet } from "@mui/icons-material";
import ListIcon from "@mui/icons-material/List";
import Homes from "./home";
import { Button } from "@mui/material";
// `npm run deploycontract` to get deployment transaction id
const contract_id = {
  /** The deployment transaction id */
  txId: "28b76d4b586b90b5638a99274f3db7524eb76ff1ec0ba843b8dc7458f5b71d9a",
  /** The output index */
  outputIndex: 0,
};

const App: React.FC = () => {
  const signerRef = useRef<PandaSigner>();

  const [contractInstance, setContract] = useState<Tipbsv>();
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const provider = new ScryptProvider();
    const signer = new PandaSigner(provider);

    signerRef.current = signer;

    fetchContract();

    const subscription = Scrypt.contractApi.subscribe(
      {
        clazz: Tipbsv,
        id: contract_id,
      },
      (event: ContractCalledEvent<Tipbsv>) => {
        setContract(event.nexts[0]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchContract() {
    try {
      const instance = await Scrypt.contractApi.getLatestInstance(
        Tipbsv,
        contract_id
      );
      setContract(instance);
    } catch (error: any) {
      console.error("fetchContract error: ", error);
    }
  }

  async function connect() {
    const provider = new ScryptProvider();
    const signer = new PandaSigner(provider);

    signerRef.current = signer;
    const { isAuthenticated, error } = await signer.requestAuth();
    if (!isAuthenticated) {
      throw new Error(`Unauthenticated: ${error}`);
    }

    setIsConnected(true);
  }

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      window.alert("Error connecting wallet or user dismissed the Auth request");
    }
  };
  
  const handleLike = async (idx: number) => {
    const signer = signerRef.current as PandaSigner;

    if (contractInstance && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      setIsConnected(true);
      await contractInstance.connect(signer);

      // Create the next instance from the current.
      const nextInstance = contractInstance.next();

      nextInstance.items[idx].like += 1n;

      // Call the method of current instance to apply the updates on chain.
      contractInstance.methods
        .like(BigInt(idx), {
          changeAddress: await signer.getDefaultAddress(),
          next: {
            instance: nextInstance,
            balance: contractInstance.balance,
          },
        } as MethodCallOptions<Tipbsv>)
        .then((result) => {
          console.log(`like call tx: ${result.tx.id}`);
        })
        .catch((e) => {
          console.error("like call error: ", e);
        });
    }
  };

  const handleRemoved = async (idx: number) => {
    const signer = signerRef.current as PandaSigner;

    if (contractInstance && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      setIsConnected(true);
      await contractInstance.connect(signer);

      // Create the next instance from the current.
      const nextInstance = contractInstance.next();
      // Set empty slot for next instance.
      nextInstance.items[idx].isRemoved = true;

      // Call the method of current instance to apply the updates on chain.
      contractInstance.methods
        .removed(BigInt(idx), {
          changeAddress: await signer.getDefaultAddress(),
          next: {
            instance: nextInstance,
            balance: contractInstance.balance,
          },
        } as MethodCallOptions<Tipbsv>)
        .then((result) => {
          console.log(`Remove call tx: ${result.tx.id}`);
        })
        .catch((e) => {
          console.error("Remove call error: ", e);
        });
    }
  };

  const handleBuy = async (idx: number, amount: number) => {
    const signer = signerRef.current as PandaSigner;

    if (contractInstance && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      setIsConnected(true);
      await contractInstance.connect(signer);

      // Create the next instance from the current.
      const nextInstance = contractInstance.next();
      // Set empty slot for next instance.
      // nextInstance.items[idx].isRemoved = true;
      nextInstance.items[idx].tipRecieved += BigInt(amount * 100 * 10 ** 6);
      // Bind custom contract call tx builder, that adds P2PKH output to pay
      // the sellers address.
      contractInstance.bindTxBuilder("tip", Tipbsv.tipTxBuilder);

      // Call the method of current instance to apply the updates on chain.
      contractInstance.methods
      .tip(BigInt(idx), BigInt(amount * 100 * 10 ** 6), {
          changeAddress: await signer.getDefaultAddress(),
          next: {
              instance: nextInstance,
              balance: contractInstance.balance,
          },
      } as MethodCallOptions<Tipbsv>)
      .then((result) => {
          console.log(`Tip call tx: ${result.tx.id}`);
      })
      .catch((e) => {
          window.alert("Error: " + e.message);
      });
  
    }
  };

  const handleAdd = async (newItem: {
    name: string;
    title: string;
    description: string;
    contact: string;
  }) => {
    const signer = signerRef.current as PandaSigner;

    if (contractInstance && signer) {
      const { isAuthenticated, error } = await signer.requestAuth();
      if (!isAuthenticated) {
        throw new Error(error);
      }

      setIsConnected(true);
      await contractInstance.connect(signer);

      // Create the next instance from the current.
      const nextInstance = contractInstance.next();

      // Find first empty slot and insert new item.
      let itemIdx: BigInt | undefined = undefined;
      for (let i = 0; i < Tipbsv.ITEM_SLOTS; i++) {
        const item = contractInstance.items[i];
        if (item.isRemoved) {
          itemIdx = BigInt(i);
          break;
        }
      }

      if (itemIdx === undefined) {
        console.error("All item slots are filled.");
        return;
      }

      // Construct new item object.
      const projectAddr = hash160((await signer.getDefaultPubKey()).toString());
      const toAdd: Item = {
        name: toByteString(newItem.name, true),
        title: toByteString(newItem.title, true),
        description: toByteString(newItem.description, true),
        // price: BigInt(newItem.price * 100 * 10 ** 6),
        projectAddr,
        contact: toByteString(newItem.contact, true),
        tipRecieved:
          contractInstance.items[Number(itemIdx)].tipRecieved *
          100n *
          10n ** 6n,
        like: contractInstance.items[Number(itemIdx)].like,
        isRemoved: false,
        percentage: Addr(
          bsv.Address.fromString(
            "mzScmxwA7rnw2S67uwWvmw6gfSFjg9TsNJ",
            bsv.Networks.testnet
          ).toByteString()
        ),
      };

      // Assign the new item to the next instance.
      nextInstance.items[Number(itemIdx)] = toAdd;

      // Call the method of the current instance to apply the updates on chain.
      contractInstance.methods
        .addProject(toAdd, itemIdx, {
          next: {
            instance: nextInstance,
            balance: contractInstance.balance,
          },
        })
        .then((result) => {
          console.log(`project added successfully: ${result.tx.id}`);
        })
        .catch((e) => {
          console.error("Error in adding project: ", e);
        });
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "1000px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "0 1rem 1.5rem 1rem",
          padding: "8px 0",
        }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://res.cloudinary.com/dzl44lobc/image/upload/v1702288573/pgz67x6ofhqr1b6c1mck.webp"
            width="120px"
            alt="Logo"
          />
          <h4 style={{ color: "#4caf50" }}>TipBSv 💰</h4>
        </div>

        <Button
          style={{
            background: "#fff",
            boxShadow: "0 4px 4px 0 #90EE90 inset, 0 4px 4px 0 #90EE90",
            padding: "0.5rem 1.25rem",
            border: "rgb(59 130 246 / 0.5)",
            borderWidth: "1px",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
          startIcon={isConnected ? <Done /> : <Wallet />}
          size="small"
          onClick={handleConnect}
          sx={{
            color: isConnected ? "green" : "red",
            "&:hover": {
              color: isConnected ? "darkgreen" : "darkred",
            },
          }}>          
          {isConnected ? "Wallet Connected" : "Connect Panda Wallet"}
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center", // Center horizontally
          margin: "20px", // Adjust margin for spacing
        }}>
        <button
          style={{
            backgroundColor: activeTab === "home" ? "darkgreen" : "green",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
            display: "flex",
            alignItems: "center", // Center icon vertically
          }}
          onClick={() => handleTabChange("home")}>
          <Home style={{ marginRight: "5px" }} /> Home
        </button>

        <button
          style={{
            backgroundColor: activeTab === "newItem" ? "darkgreen" : "green",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
            display: "flex",
            alignItems: "center", // Center icon vertically
          }}
          onClick={() => handleTabChange("newItem")}>
          <AddTask style={{ marginRight: "5px" }} /> New Projects
        </button>

        <button
          style={{
            backgroundColor: activeTab === "itemList" ? "darkgreen" : "green",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
            display: "flex",
            alignItems: "center", // Center icon vertically
          }}
          onClick={() => handleTabChange("itemList")}>
          <ListIcon style={{ marginRight: "5px" }} /> Projects List
        </button>

        <button
          style={{
            backgroundColor: activeTab === "about" ? "darkgreen" : "green",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center", // Center icon vertically
          }}
          onClick={() => handleTabChange("about")}>
          <Info style={{ marginRight: "5px" }} /> About Us
        </button>
      </div>

      <hr />
      <div style={{ marginTop: "20px" }}>
        {activeTab === "newItem" && <NewItem onAdd={handleAdd} />}
        {activeTab === "itemList" && (
          <ItemList
            items={contractInstance ? (contractInstance.items as Item[]) : []}
            onBuy={handleBuy}
            handlelike={handleLike}
            handleRemoved={handleRemoved}
          />
        )}
        {activeTab === "home" && <Homes/>}
      </div>
    </div>
  );
};

export default App;