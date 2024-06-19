import { Divider, Stack, Typography } from "@mui/material";

export interface CardHeaderProps {
  title: string;
}

export function CardHeader({ title }: CardHeaderProps) {
  return (
    <Stack mb={1}>
      <Typography
        variant="body1"
        sx={{ fontWeight: "medium", fontSize: 22, my: 1 }}
      >
        {title}
      </Typography>
      <Divider
        sx={{
          width: "100%",
          borderColor: "text.primary",
        }}
      />
    </Stack>
  );
}
