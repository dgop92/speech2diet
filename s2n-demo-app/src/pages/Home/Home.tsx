import { useState } from "react";
import { FullPageBox } from "../../components/Layout/FullPageBox";
import { MainSection } from "./MainSection";
import { NutritionInformationResponse } from "../../entities/nutrition-information-response";
import { ResultsSection } from "./ResultsSection/ResultsSection";

export function HomePage() {
  const [results, setResults] = useState<NutritionInformationResponse | null>(
    null
  );

  console.log(results);

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
    </FullPageBox>
  );
}
