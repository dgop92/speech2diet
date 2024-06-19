import { Typography } from "@mui/material";

export interface AttrTypographyProps {
  attrName: string;
  attrValue: string;
  defaultValue?: string;
}

export function AttrTypography({
  attrName,
  attrValue,
  defaultValue,
}: AttrTypographyProps) {
  let finalValue: string = attrValue;
  if (finalValue === "") {
    finalValue = defaultValue ?? "";
  }

  return (
    <Typography variant="body1">
      <Typography component="span" fontWeight="medium">
        {attrName}:
      </Typography>{" "}
      {finalValue}
    </Typography>
  );
}
