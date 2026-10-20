export type ContentFormState = {
  saved?: boolean;
  errors?: { path: string; message: string }[];
  formError?: string;
};
