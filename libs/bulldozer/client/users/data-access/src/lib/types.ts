export interface ItemView<T> {
  document: T;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}
