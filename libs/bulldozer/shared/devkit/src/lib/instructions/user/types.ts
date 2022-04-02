export interface CreateUserParams {
  authority: string;
  name: string;
  userName: string;
  thumbnailUrl: string;
}

export interface UpdateUserParams {
  authority: string;
  name: string;
  userName: string;
  thumbnailUrl: string;
}

export interface DeleteUserParams {
  authority: string;
}
