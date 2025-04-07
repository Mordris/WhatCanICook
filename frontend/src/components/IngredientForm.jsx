import React from "react";
import { Paper, Stack, Group, Button, TagsInput } from "@mantine/core"; // Import TagsInput
import { IconX, IconSearch } from "@tabler/icons-react";
import { useMantineTheme } from "@mantine/core";

function IngredientForm({
  ingredients, // Now expects an array of strings
  onIngredientsChange, // Now receives an array of strings
  onSubmit,
  onClear,
  isLoading,
  canClear,
}) {
  const theme = useMantineTheme();

  // Handler specifically for TagsInput onChange
  const handleTagsChange = (tags) => {
    // Pass the array of tags directly up
    onIngredientsChange(tags);
  };

  return (
    <Paper shadow="md" p="xl" radius="md" withBorder>
      <Stack>
        {/* Replace Textarea with TagsInput */}
        <TagsInput
          label="Available Ingredients"
          description="Type an ingredient and press Enter"
          placeholder="e.g., Chicken, Broccoli, Rice..."
          value={ingredients} // Bind to the array state
          onChange={handleTagsChange} // Use the specific handler
          disabled={isLoading}
          clearable // Allow clearing all tags with an 'x'
          radius="sm"
          // Optional: Add validation or max tags if needed
          // maxTags={20}
        />
        <Group justify="space-between" mt="md">
          {" "}
          {/* Added margin top */}
          <Button
            onClick={onClear}
            variant="outline"
            color="gray"
            disabled={isLoading || !canClear}
            radius="sm"
            leftSection={<IconX size={16} />}
          >
            Clear
          </Button>
          <Button
            onClick={onSubmit}
            loading={isLoading}
            // Disable if loading or the ingredients array is empty
            disabled={isLoading || ingredients.length === 0}
            size="md"
            radius="sm"
            leftSection={<IconSearch size={18} />}
            variant="gradient"
            gradient={{ from: theme.primaryColor, to: "teal", deg: 105 }}
          >
            Find Recipes
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

export default IngredientForm;
