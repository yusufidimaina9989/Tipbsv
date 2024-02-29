import React from "react";
import { Box } from "@mui/material";
import ItemView from "./projectView";
import { Item } from "./contracts/tipbsv";

interface ItemListProps {
  items: Item[];
  handlelike: (idx: number) => void;
  handleRemoved: (idx: number) => void;
  onBuy: (idx: number, amount: number) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  onBuy,
  handlelike,
  handleRemoved,
}) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
    {items.map(
      (item, idx) =>
        !item.isRemoved && (
          <ItemView
            key={idx}
            item={item}
            idx={idx}
            onBuy={onBuy}
            handleLike={handlelike}
            handleRemoved={handleRemoved}
          />
        )
    )}
  </Box>
);

export default ItemList;
