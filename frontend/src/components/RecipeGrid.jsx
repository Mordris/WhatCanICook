import React from "react";
import { SimpleGrid, Stack, Divider, Box } from "@mantine/core";
import RecipeCard from "./RecipeCard";

// Pass image props down
function RecipeGrid({ recipes = [], keywords = [], isImageLoading }) {
  if (!recipes || recipes.length === 0) {
    return null;
  }

  if (recipes.length === 1 && recipes[0].title === "Note from Chef") {
    return (
      <Stack mt="xl" gap="lg">
        <Divider label="Note from Chef" labelPosition="center" />
        {/* Pass loading state even for note card for consistency, though no image */}
        <RecipeCard
          recipe={recipes[0]}
          keywords={keywords}
          isImageLoading={isImageLoading}
        />
      </Stack>
    );
  }

  return (
    <Stack mt="xl" gap="lg">
      <Divider label="Chef's Suggestions" labelPosition="center" />
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="lg"
        verticalSpacing="lg"
      >
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={recipe.title + index + (recipe.imageData?.id || "")} // Include image id in key
            recipe={recipe}
            keywords={keywords}
            // Pass image data from the recipe object
            imageUrl={recipe.imageData?.urls?.small} // Use small image for cards
            imageAlt={recipe.imageData?.alt_description}
            photographerName={recipe.imageData?.user?.name}
            photographerUrl={recipe.imageData?.user?.link}
            photoUrl={recipe.imageData?.photoLink}
            isImageLoading={isImageLoading} // Pass down loading state
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

export default RecipeGrid;
