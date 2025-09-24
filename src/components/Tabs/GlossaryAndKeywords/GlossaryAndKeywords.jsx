import React from "react";
import { getTabObjects } from "../../../services/api";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";

const GlossaryAndKeywords = (props) => {
  const { chapterId } = props;

  const { data: tabObjects, isFetching } = useQuery({
    queryKey: ["tab-objects-glossary"],
    queryFn: () => getTabObjects(chapterId, "glossary"),
    refetchOnWindowFocus: false,
  });

  if (isFetching) return <CircularProgress size="1rem" />;

  return (
    <div style={{ padding: "0.5rem" }}>
      {tabObjects?.map((tabObject) => (
        <p key={tabObject._id}>
          <strong>{tabObject.term}</strong>
          <br />
          <span>{tabObject.definition}</span>
        </p>
      ))}
    </div>
  );
};

export default GlossaryAndKeywords;
