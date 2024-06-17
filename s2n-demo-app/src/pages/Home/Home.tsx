import { FullPageBox } from "../../components/Layout/FullPageBox";
import { Typography, Container } from "@mui/material";

export function HomePage() {
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
            mb: 1,
          }}
        >
          Fitvoice / Speech 2 Diet
        </Typography>
      </Container>
    </FullPageBox>
  );
}
