export interface NewClientFormData {
  lastName: string;
  firstName: string;
  patronymic: string;
  company: string;
  phone: string;
  email: string;
  telegram: string;
  instagram: string;
  socialLink: string;
  managerId: string;
  city: string;
  address: string;
  comments: string;
  acquisitionSource: string;
}

export interface StepLogicState {
  step: number;
  loading: boolean;
  clientType: "b2c" | "b2b";
  validationError: string;
  ignoreDuplicates: boolean;
}
