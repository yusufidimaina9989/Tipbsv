import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
} from "@mui/material";
import { Item } from "./contracts/tipbsv";
import { bsv, ScryptProvider, PandaSigner, toByteString, toHex } from "scrypt-ts";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";

interface ItemProps {
  item: Item;
  idx: number;
  onBuy: (idx: number, tipAmount: number) => void;
  handleLike: (idx: number) => void;
  handleRemoved: (idx: number) => void;
}

const ItemView: React.FC<ItemProps> = ({
  item,
  idx,
  onBuy,
  handleLike,
  handleRemoved,
}) => {
  const [tipAmount, setTipAmount] = useState("");
  const [user, setUser] = useState<bsv.Address | undefined>(undefined);

  useEffect(() => {
    const fetchUser = async () => {
      const provider = new ScryptProvider();
      const signer = new PandaSigner(provider);
      setUser(await signer.getDefaultAddress());
    };

    fetchUser();
  }, []);

  const handleTip = () => {
    const tipValue = parseFloat(tipAmount);
    if (!isNaN(tipValue) && tipValue > 0) {
      onBuy(idx, tipValue);
      // You can reset the tipAmount state or perform any other necessary actions
      setTipAmount("");
    } else {
      // Handle invalid tip amount input
      alert("Please enter a valid tip amount.");
    }
  };
  return (
    <Card sx={{ minWidth: 700, m: 4 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {Buffer.from(item.name, "hex").toString("utf8")}
        </Typography>
        <hr />
        <Typography variant="h5" component="div">
          Title : {Buffer.from(item.title, "hex").toString("utf8")}
        </Typography>
        <Typography variant="h6" component="div">
          Description : {Buffer.from(item.description, "hex").toString("utf8")}
        </Typography>
        <Typography variant="h6" component="div">
          Contact :{" "}
          <a
            href={`mailto:${Buffer.from(item.contact, "hex").toString(
              "utf8"
            )}`}>
            Send Email
          </a>
          {/* Contact : {Buffer.from(item.contact, "hex").toString("utf8")} */}
        </Typography>
        <Typography variant="h6" component="div">
          Tip Recieved : {Number(item.tipRecieved) / (100 * 10 ** 6)} BSV
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Project Wallet:{" "}
          {bsv.Address.fromHex("6f" + item.projectAddr).toString()}
        </Typography>
        <br />
        <div style={{ display: "flex", alignItems: "center" }}>
          {user && (item.projectAddr === user.toByteString()) ? (
            <Button
              variant="contained"
              onClick={() => handleRemoved(idx)}
              style={{
                minWidth: "100px",
                height: "55px",
                marginLeft: "8px",
                color: "white",
                backgroundColor: "red",
              }}>
              🗑️ (remove)
            </Button>
          ) : (
            <div>
              <TextField
                type="number"
                label="Enter Tip Amount"
                variant="outlined"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                style={{ width: "200px", marginRight: "8px" }}
              />
              <Button
                variant="contained"
                color="success"
                onClick={handleTip}
                style={{ minWidth: "100px", height: "55px" }}>
                <VolunteerActivismIcon /> 💰 (tip)
              </Button>
              <Button
                variant="contained"
                onClick={() => handleLike(idx)}
                style={{
                  minWidth: "100px",
                  height: "55px",
                  marginLeft: "8px",
                  color: "pink",
                  backgroundColor: "transparent",
                }}>
                {"❤️"} ({Number(item.like)})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemView;
