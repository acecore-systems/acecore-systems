type SubjectInput = {
  currentValue: string;
  categoryValue: string;
  selectedLabel: string;
  locale: string;
  suffix: string;
};

export function getConsultationSubject(input: SubjectInput): string {
  if (input.currentValue.trim() || !input.categoryValue || !input.selectedLabel)
    return input.currentValue;
  return input.locale === "ja"
    ? `${input.selectedLabel.replace(/について$/u, "")}${input.suffix}`
    : [input.selectedLabel, input.suffix].filter(Boolean).join(" — ");
}
