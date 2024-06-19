import { BaseModal, ModalHeader } from "../../components/Modal";
import { Button, Link, Stack, Typography } from "@mui/material";
import { NutritionInformationResponse } from "../../entities/nutrition-information-response";
import {
  NUTRITION_INFORMATION_RESPONSE_EXAMPLE_1,
  NUTRITION_INFORMATION_RESPONSE_EXAMPLE_2,
  NUTRITION_INFORMATION_RESPONSE_EXAMPLE_3,
} from "../../entities/examples";

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  setExample: (example: NutritionInformationResponse) => void;
}

const EXAMPLES = [
  NUTRITION_INFORMATION_RESPONSE_EXAMPLE_1,
  NUTRITION_INFORMATION_RESPONSE_EXAMPLE_2,
  NUTRITION_INFORMATION_RESPONSE_EXAMPLE_3,
];

export default function HelpModal({
  open,
  onClose,
  setExample,
}: HelpModalProps) {
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      extraBaseStyles={{ maxWidth: "900px", width: "95%" }}
    >
      <Stack sx={{ height: "100%", gap: 1 }}>
        <ModalHeader title="Información sobre la app" onClose={onClose} />
        <Typography variant="body1">
          Esta web app es un demo del servicio principal de mi proyecto final de
          grado, una aplicación que permite a las personas hacer un seguimiento
          de su ingesta de alimentos registrando por voz lo que comen a lo largo
          del día. Más información en:{" "}
          <Link
            rel="noopener"
            target="_blank"
            href="https://github.com/dgop92/speech2diet"
          >
            Github
          </Link>
        </Typography>
        <Typography variant="body1">
          Para controlar el abuso del demo solo puedes realizar 5 usos por día.
          La base de datos nutricional fue construida a través de fuentes
          gratuitas de internet, por ende puede que no se encuentre algún
          alimento y su información no es 100% precisa.
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          Ejemplos:
        </Typography>
        <Stack direction="row" gap={1} alignSelf="center">
          {EXAMPLES.map((example, index) => (
            <Button
              color="primary"
              variant="text"
              key={index}
              onClick={() => setExample(example)}
            >
              Ejemplo {index + 1}
            </Button>
          ))}
        </Stack>
      </Stack>
    </BaseModal>
  );
}
