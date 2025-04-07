import React from "react";
import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <Alert
      icon={<IconAlertCircle size="1.2rem" />}
      title="Oops! Something went wrong."
      color="red"
      radius="md"
      withCloseButton={!!onClose} // Only show close button if handler is provided
      onClose={onClose}
      mt="xl" // Add margin top
      variant="light"
    >
      {/* Display message safely */}
      {String(message)}
    </Alert>
  );
}

export default ErrorMessage;
