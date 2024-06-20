import { BaseModal, ModalHeader } from "../../../components/Modal";
import { FoodRecord } from "../../../entities/nutrition-information-response";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { FoodItemContent } from "./FoodItemContent";
import React from "react";

export interface SuggestionModalProps {
  open: boolean;
  onClose: () => void;
  suggestions: FoodRecord[];
}

export function SuggestionModal({
  open,
  onClose,
  suggestions,
}: SuggestionModalProps) {
  const atLeastOneSuggestion = suggestions.length > 0;

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      extraBaseStyles={{
        maxWidth: "900px",
        width: "95%",
        height: "95%",
        maxHeight: "650px",
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <ModalHeader title="Sugerencias" onClose={onClose} />
        <Stack gap={2} mt={2} sx={{ overflowY: "scroll" }}>
          {atLeastOneSuggestion ? (
            suggestions.map((suggestion, index) => (
              <React.Fragment key={index}>
                <Box>
                  <Typography variant="body1" fontWeight="medium" mb={1}>
                    Sugerencia {index + 1}
                  </Typography>
                  <Divider sx={{ width: "100%" }} />
                </Box>
                <Box>
                  <FoodItemContent foodItem={suggestion} />
                </Box>
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body1">
              No hay sugerencias para este alimento.
            </Typography>
          )}
        </Stack>
      </Stack>
    </BaseModal>
  );
}
