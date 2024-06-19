import { Box, Container, Divider, Typography } from "@mui/material";
import { NutritionInformationResponse } from "../../../entities/nutrition-information-response";
import { NotFoodsCard } from "./NotFoodsCard";
import { FoodCard } from "./FoodCard";
import { PrimaryButton } from "../../../components/buttons";

export interface ResultsSectionProps {
  nutritionInformationResponse: NutritionInformationResponse;
  goToHome: () => void;
}

export function ResultsSection({
  nutritionInformationResponse,
  goToHome,
}: ResultsSectionProps) {
  const atLeastOneFoodDetected =
    nutritionInformationResponse.food_responses.length > 0;

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        my: 4,
      }}
    >
      <Box width="100%">
        <Typography
          variant="h1"
          component="h1"
          textAlign="center"
          sx={{
            fontFamily: "titleFontFamily",
            fontWeight: "medium",
            fontSize: { xs: 36, lg: 48 },
          }}
        >
          Resultados
        </Typography>
        <Divider
          sx={{
            mt: 4,
            width: "100%",
            borderWidth: "0.1rem",
            borderColor: "text.primary",
          }}
        />
      </Box>
      <Typography
        variant="body1"
        textAlign="center"
        sx={{
          my: 8,
          fontSize: { xs: 18, lg: 24 },
          fontWeight: "normal",
        }}
      >
        Transcripción: {nutritionInformationResponse.raw_transcript}
      </Typography>

      {atLeastOneFoodDetected ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(auto-fill, minmax(350px, 1fr))",
              md: "repeat(auto-fill, minmax(450px, 1fr))",
            },
            width: "100%",
            gap: 4,
          }}
        >
          {nutritionInformationResponse.food_requests.map(
            (foodRequest, index) => (
              <FoodCard
                key={index}
                foodNutritionRequest={foodRequest}
                foodNutritionResponse={
                  nutritionInformationResponse.food_responses[index]
                }
              />
            )
          )}
        </Box>
      ) : (
        <NotFoodsCard />
      )}
      <PrimaryButton size="small" onClick={goToHome} sx={{ px: 6, mt: 4 }}>
        Ir al inicio
      </PrimaryButton>
    </Container>
  );
}
