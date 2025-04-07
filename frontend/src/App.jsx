import { useState, useCallback, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Group,
  Stack,
  useMantineTheme,
  SimpleGrid,
  Skeleton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconSparkles } from "@tabler/icons-react";

// Import Components
import IngredientForm from "./components/IngredientForm";
import RecipeGrid from "./components/RecipeGrid";
import ErrorMessage from "./components/ErrorMessage";

// Import Services & Utils
import { fetchSuggestions } from "./services/apiService.js";
import { fetchUnsplashImage } from "./services/unsplashService.js"; // Import Unsplash service
import { parseRecipeMarkdown } from "./utils/markDownParser.js";

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false); // For Gemini API
  const [isLoadingImages, setIsLoadingImages] = useState(false); // For Unsplash API
  const [error, setError] = useState(null);
  const theme = useMantineTheme();

  const ingredientKeywords = useMemo(() => ingredients, [ingredients]);

  const handleIngredientsChange = (newIngredientsArray) => {
    setIngredients(newIngredientsArray);
  };

  // --- Function to fetch images for recipes ---
  const fetchAndSetImages = async (currentRecipes) => {
    if (!currentRecipes || currentRecipes.length === 0) return;

    setIsLoadingImages(true); // Start image loading indicator
    const imageFetchPromises = currentRecipes.map(
      (recipe) => fetchUnsplashImage(recipe.title) // Call Unsplash service for each title
    );

    try {
      const imageResults = await Promise.all(imageFetchPromises);

      // Add the fetched image data (or null) to each recipe object
      const recipesWithImageData = currentRecipes.map((recipe, index) => ({
        ...recipe,
        imageData: imageResults[index], // Add imageResult under imageData key
      }));

      setRecipes(recipesWithImageData); // Update state with recipes including image data
    } catch (imgError) {
      // Handle potential errors from Promise.all (less likely with current service setup)
      console.error("Error fetching images in parallel:", imgError);
      // Optionally show a notification about image fetching failure
      notifications.show({
        title: "Image Fetching Issue",
        message: "Could not load all recipe images.",
        color: "orange",
      });
      // Keep existing recipes without images if fetch fails
      setRecipes(currentRecipes);
    } finally {
      setIsLoadingImages(false); // Stop image loading indicator
    }
  };
  // --- End fetch images function ---

  const handleSuggestRecipes = useCallback(async () => {
    if (ingredients.length === 0) return;

    setIsLoadingRecipes(true); // Start recipe loading
    setIsLoadingImages(false); // Ensure image loading is false initially
    setError(null);
    setRecipes([]);

    const loadingNotificationId = notifications.show({
      id: "loading-recipes",
      loading: true,
      title: "Generating Recipes...",
      message: "Asking the chef for ideas!",
      autoClose: false,
      withCloseButton: false,
    });

    let fetchedRecipes = []; // Temporary variable to hold recipes before image fetch

    try {
      const ingredientsString = ingredients.join(", ");
      const data = await fetchSuggestions(ingredientsString);
      const rawSuggestions = data.suggestions || "";
      const parsed = parseRecipeMarkdown(rawSuggestions);

      if (parsed.length > 0) {
        fetchedRecipes = parsed; // Store parsed recipes temporarily
        // Don't update state *yet*, wait for images
        notifications.update({
          /* ... Success notification ... */ id: loadingNotificationId,
          color: "teal",
          title: `Found ${parsed.length} Recipe Idea${
            parsed.length > 1 ? "s" : ""
          }!`,
          message: "Fetching images...", // Update message
          icon: <IconSparkles size="1rem" />,
          autoClose: 2000, // Shorter duration
        });
      } else if (rawSuggestions.trim().length > 0) {
        const note = {
          title: "Note from Chef",
          ingredients: [],
          instructions: [rawSuggestions.trim()],
        };
        fetchedRecipes = [note]; // Store the note
        notifications.update({
          /* ... Note notification ... */ id: loadingNotificationId,
          color: "yellow",
          title: "Note from Chef",
          message: "Received a note instead of recipe steps.",
          icon: <IconAlertCircle size="1rem" />,
          autoClose: 5000,
        });
      } else {
        setError("The chef couldn't find any recipes for these ingredients.");
        notifications.update({
          /* ... No recipes notification ... */ id: loadingNotificationId,
          color: "orange",
          title: "No Recipes Found",
          message: "Try adding more or different ingredients.",
          icon: <IconAlertCircle size="1rem" />,
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Error in handleSuggestRecipes:", err);
      const errorMessage = err.message || "An unknown error occurred.";
      setError(errorMessage);
      notifications.update({
        /* ... Error notification ... */ id: loadingNotificationId,
        color: "red",
        title: "Error Generating Recipes",
        message: errorMessage,
        icon: <IconAlertCircle size="1rem" />,
        autoClose: 6000,
      });
    } finally {
      setIsLoadingRecipes(false); // Stop recipe loading specifically
      // If recipes were found, trigger image fetching AFTER setting isLoadingRecipes to false
      if (fetchedRecipes.length > 0) {
        // Set the initial recipes without image data so skeletons show correctly
        setRecipes(fetchedRecipes);
        // Fetch images asynchronously
        fetchAndSetImages(fetchedRecipes);
      }
    }
  }, [ingredients]);

  const handleClear = () => {
    setIngredients([]);
    setRecipes([]);
    setError(null);
    setIsLoadingRecipes(false); // Ensure loading states are reset
    setIsLoadingImages(false);
  };

  const canClear =
    ingredients.length > 0 || recipes.length > 0 || error !== null;

  // Combine loading states for skeleton display
  const showSkeletons =
    isLoadingRecipes || (recipes.length > 0 && isLoadingImages && !error);

  return (
    <Container size="lg" py={40}>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="center" gap="sm">
          <img
            src="/chef-hat.svg"
            alt="Chef Hat Icon"
            width={42}
            height={42}
            style={{ verticalAlign: "middle" }}
          />
          <Title
            order={1}
            ta="center"
            style={{ fontFamily: theme.headings.fontFamily }}
          >
            What Can I Cook?
          </Title>
        </Group>
        <Text c="dimmed" ta="center" size="lg">
          Let AI spice up your mealtime! Enter your ingredients below.
        </Text>

        {/* Form Component */}
        <IngredientForm
          ingredients={ingredients}
          onIngredientsChange={handleIngredientsChange}
          onSubmit={handleSuggestRecipes}
          onClear={handleClear}
          isLoading={isLoadingRecipes || isLoadingImages} // Button is disabled if either is loading
          canClear={canClear}
        />

        {/* Loading Skeletons (Show if fetching recipes OR if recipes exist but images are loading) */}
        {showSkeletons && (
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="lg"
            verticalSpacing="lg"
            mt="xl"
          >
            {/* Show skeletons based on expected number of recipes or a fixed number */}
            {[...Array(recipes.length > 0 ? recipes.length : 3)].map(
              (_, index) => (
                <Skeleton key={index} height={350} radius="md" /> // Increased height for image space
              )
            )}
          </SimpleGrid>
        )}

        {/* Error Display (Show only if not loading recipes/images) */}
        {!isLoadingRecipes && !isLoadingImages && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        {/* Results Grid (Show only if NOT loading skeletons AND no error) */}
        {!showSkeletons && !error && (
          <RecipeGrid
            recipes={recipes}
            keywords={ingredientKeywords}
            isImageLoading={isLoadingImages} // Pass image loading state
          />
        )}

        {/* Footer */}
        <Text c="dimmed" ta="center" size="sm" mt="xl">
          Powered by Google Gemini, Unsplash & Mantine UI
        </Text>
      </Stack>
    </Container>
  );
}

export default App;
