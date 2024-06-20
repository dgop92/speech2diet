import { useEffect, useState } from "react";
import { FullPageBox } from "../../components/Layout/FullPageBox";
import { MainSection } from "./MainSection";
import { NutritionInformationResponse } from "../../entities/nutrition-information-response";
import { ResultsSection } from "./ResultsSection/ResultsSection";
import { Fab } from "@mui/material";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import HelpModal from "./HelpModal";

export function HomePage() {
  const [results, setResults] = useState<NutritionInformationResponse | null>(
    null
  );
  const [openHelpModal, setOpenHelpModal] = useState(false);

  useEffect(() => {
    const firstTime = localStorage.getItem("firstTime");
    if (firstTime === null) {
      setOpenHelpModal(true);
      localStorage.setItem("firstTime", "false");
    }
  }, []);

  return (
    <FullPageBox justifyContent="center" alignItems="center">
      {results !== null ? (
        <ResultsSection
          nutritionInformationResponse={results}
          goToHome={() => setResults(null)}
        />
      ) : (
        <MainSection setResults={setResults} />
      )}
      <Fab
        color="primary"
        aria-label="pick-position"
        size="medium"
        sx={{ boxShadow: "none", position: "fixed", bottom: 16, right: 16 }}
        onClick={() => setOpenHelpModal(true)}
      >
        <QuestionMarkIcon />
      </Fab>
      <HelpModal
        open={openHelpModal}
        onClose={() => setOpenHelpModal(false)}
        setExample={(ex) => {
          setResults(ex);
          setOpenHelpModal(false);
        }}
      />
    </FullPageBox>
  );
}
