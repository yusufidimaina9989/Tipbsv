import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { AddTask } from "@mui/icons-material";

interface NewItemProps {
  onAdd: (item: {
    name: string;
    title: string;
    description: string;
    contact: string;
  }) => void;
}

const NewItem: React.FC<NewItemProps> = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAdd({ name, title, description, contact });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ m: 2 }}>
      <TextField
        id="name"
        label="Startup/company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        id="title"
        label="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        id="description"
        label="project description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        id="contact"
        label="contact "
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={<AddTask />}
        sx={{ mt: 2, backgroundColor: "green", color: "white" }}>
        Add New Project
      </Button>
    </Box>
  );
};

export default NewItem;
