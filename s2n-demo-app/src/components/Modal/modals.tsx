import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

const modalBaseStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  p: 3,
  outline: 0,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  borderRadius: (theme: any) => theme.spacing(1),
};

export interface CardTitleProps {
  title: string;
  extraStyles?: Record<string, unknown>;
}

function CardTitle({ title, extraStyles = {} }: CardTitleProps) {
  return (
    <Typography
      component="h6"
      variant="h6"
      sx={{
        fontFamily: (theme) => theme.typography.titleFontFamily,
        fontWeight: 700,
        ...extraStyles,
      }}
    >
      {title}
    </Typography>
  );
}

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  extraBaseStyles?: Record<string, unknown>;
}

export function BaseModal({
  open,
  onClose,
  children,
  extraBaseStyles = {},
}: BaseModalProps) {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      open={open}
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Box sx={{ ...modalBaseStyle, ...extraBaseStyles }}>{children}</Box>
      </Fade>
    </Modal>
  );
}

export interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <CardTitle title={title} extraStyles={{ flexGrow: 1 }} />
      <IconButton color="inherit" onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
