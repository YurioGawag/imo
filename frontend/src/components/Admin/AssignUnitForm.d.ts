export interface AssignUnitFormProps {
  onSubmit: (unitId: string) => void;
  onCancel: () => void;
}

declare function AssignUnitForm(props: AssignUnitFormProps): JSX.Element;
export default AssignUnitForm;
