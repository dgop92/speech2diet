import { Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FullPageBox } from "../components/Layout/FullPageBox";
import { PrimaryButton } from "../components/buttons";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <FullPageBox justifyContent="center" alignItems="center">
      <Container
        maxWidth="xl"
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Typography
          variant="h1"
          component="h1"
          textAlign="center"
          sx={{
            fontFamily: "titleFontFamily",
            fontWeight: "medium",
            fontSize: { xs: 36, lg: 48 },
            mb: 4,
          }}
        >
          404 Not Found
        </Typography>
        <PrimaryButton
          size="small"
          onClick={() => navigate("/")}
          sx={{ px: 6 }}
        >
          Ir al inicio
        </PrimaryButton>
      </Container>
    </FullPageBox>
  );
}
