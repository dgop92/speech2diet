import { Stack, Typography } from "@mui/material";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

export function NotFoodsCard() {
  return (
    <Stack
      sx={{
        backgroundColor: "white",
        borderRadius: "0.5rem",
        p: 2,
        width: { xs: "100%", lg: "50%" },
        alignItems: "center",
        gap: 1,
      }}
    >
      <SentimentDissatisfiedIcon
        sx={{
          fontSize: 48,
          color: "text.secondary",
        }}
      />
      <Typography variant="body1" textAlign="center">
        lo sentimos, no pudimos encontrar ningún alimento en la transcripción
      </Typography>
    </Stack>
  );
}
