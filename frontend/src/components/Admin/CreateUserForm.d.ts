import { CreateUserData } from '../../services/user.service';

export interface CreateUserFormProps {
  onSubmit: (userData: CreateUserData) => void;
  onCancel: () => void;
}

declare function CreateUserForm(props: CreateUserFormProps): JSX.Element;
export default CreateUserForm;
