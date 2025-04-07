import React from "react";
import {
  Card,
  Stack,
  Title,
  Group,
  ThemeIcon,
  Text,
  List,
  Highlight,
  Divider,
  Image,
  Anchor,
  Box,
  Skeleton,
} from "@mantine/core"; // Added Anchor, Box, Skeleton
import {
  IconToolsKitchen2,
  IconListNumbers,
  IconPhoto,
} from "@tabler/icons-react"; // Added IconPhoto

// Removed imageUtils import as image URL comes from props now

function RecipeCard({
  recipe,
  keywords = [],
  // --- New Image Props ---
  imageUrl,
  imageAlt,
  photographerName,
  photographerUrl,
  photoUrl,
  isImageLoading, // Prop to indicate if image is still loading
  // -----------------------
}) {
  if (!recipe) return null;

  const instructionsAreNumbered =
    recipe.instructions.length > 0 &&
    recipe.instructions.every((inst) => /^\d+\.?\s*/.test(inst));

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Stack gap="md" h="100%">
        {/* --- Image Section with Loading State & Attribution --- */}
        <Card.Section>
          {/* Show Skeleton while image is loading */}
          {isImageLoading && <Skeleton height={180} animate={true} />}

          {/* Show Image once URL is available and not loading */}
          {!isImageLoading && imageUrl && (
            <Image
              src={imageUrl}
              height={180}
              alt={imageAlt || `Image for ${recipe.title}`}
              // You can add a fallback if you have a generic one
              // fallbackSrc="path/to/your/placeholder.png"
            />
          )}

          {/* Show placeholder if no image URL and not loading */}
          {!isImageLoading && !imageUrl && (
            <Box
              h={180}
              bg="gray.1"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ThemeIcon variant="light" size="xl" color="gray">
                <IconPhoto stroke={1.5} />
              </ThemeIcon>
            </Box>
          )}
        </Card.Section>
        {/* --- Attribution --- */}
        {/* Display ONLY if image data is present */}
        {!isImageLoading &&
          imageUrl &&
          photographerName &&
          photographerUrl &&
          photoUrl && (
            <Text size="xs" c="dimmed" ta="right" mt={-10} mb={5} px="md">
              {" "}
              {/* Adjust positioning */}
              Photo by{" "}
              <Anchor
                href={`${photographerUrl}?utm_source=what_can_i_cook&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                fz="xs"
              >
                {photographerName}
              </Anchor>{" "}
              on{" "}
              <Anchor
                href={`https://unsplash.com/?utm_source=what_can_i_cook&utm_medium=referral`}
                target="_blank"
                rel="noopener noreferrer"
                fz="xs"
              >
                Unsplash
              </Anchor>
              {/* Optional: Link directly to photo page */}
              {/* {' ('}<Anchor href={`${photoUrl}?utm_source=what_can_i_cook&utm_medium=referral`} target="_blank" rel="noopener noreferrer" fz="xs">view</Anchor>{')'} */}
            </Text>
          )}
        {/* ------------------- */}
        <Title order={3} ta="center" lineClamp={2} mt={imageUrl ? 0 : "sm"}>
          {recipe.title}
        </Title>{" "}
        {/* Adjust margin based on image */}
        {/* Ingredients Section (remains the same) */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Stack gap="xs">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="lime">
                <IconToolsKitchen2 size={14} />
              </ThemeIcon>
              <Text fw={500} size="sm">
                Ingredients
              </Text>
            </Group>
            <List size="sm" spacing="xs" withPadding>
              {recipe.ingredients.map((ing, i) => (
                <List.Item key={`ing-${i}`}>
                  <Highlight highlight={keywords} highlightColor="yellow">
                    {ing}
                  </Highlight>
                </List.Item>
              ))}
            </List>
          </Stack>
        )}
        {/* Divider (remains the same) */}
        {recipe.ingredients?.length > 0 && recipe.instructions?.length > 0 && (
          <Divider my="xs" />
        )}
        {/* Instructions Section (remains the same) */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <Stack gap="xs">
            {/* ... instruction rendering logic ... */}
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="blue">
                <IconListNumbers size={14} />
              </ThemeIcon>
              <Text fw={500} size="sm">
                Instructions
              </Text>
            </Group>
            {instructionsAreNumbered ? (
              <Text
                size="sm"
                component="div"
                style={{ lineHeight: 1.6, paddingLeft: "1.5em" }}
              >
                {recipe.instructions.map((inst, i) => (
                  <div key={`inst-${i}`} style={{ textIndent: "-1.5em" }}>
                    {" "}
                    {inst}{" "}
                  </div>
                ))}
              </Text>
            ) : (
              <List type="ordered" size="sm" spacing="xs" withPadding>
                {recipe.instructions.map((inst, i) => (
                  <List.Item key={`inst-${i}`}>{inst}</List.Item>
                ))}
              </List>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

export default RecipeCard;
