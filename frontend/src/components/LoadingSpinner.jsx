import React from "react";
import { Loader, Group, Text } from "@mantine/core";
import { useMantineTheme } from "@mantine/core";

function LoadingSpinner({ message = "Loading..." }) {
  const theme = useMantineTheme();
  return (
    <Group justify="center" mt="xl">
      <Loader color={theme.primaryColor} />
      <Text>{message}</Text>
    </Group>
  );
}

export default LoadingSpinner;
