import { useState } from "react";
import { FullPageBox } from "../../components/Layout/FullPageBox";
import { MainSection } from "./MainSection";

export function HomePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);

  console.log(results);

  return (
    <FullPageBox justifyContent="center" alignItems="center">
      <MainSection setResults={setResults} />
    </FullPageBox>
  );
}
