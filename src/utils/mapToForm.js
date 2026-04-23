export function mapToForm(type, trialAreas) {
  const sorted = [...trialAreas].sort((a, b) => a.order - b.order);
  switch (type) {
    case "Text MCQ":
      return mapMCQ(sorted);
    default:
      throw new Error(`mapToForm: type "${type}" is not yet supported`);
  }
}

function mapMCQ(sortedAreas) {
  console.log("sortedAreas= ", sortedAreas);
  const questionArea = sortedAreas.find((a) => a.parameter === "*_question_");
  const optionAreas = sortedAreas.filter((a) => a.parameter === "*_option_");

  const answers = optionAreas.map((area) => ({
    _OptionText_: area.text,
    _Correct_: false,
    _ChosenFeedback_: "",
    _notChosenFeedback_: "",
    _Tip_: "",
  }));

  return {
    _Question_: questionArea?.text ?? "",
    [`Answers  ${answers.length}`]: answers,
  };
}
