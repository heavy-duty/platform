import { UserDto } from '../../utils';

export interface CreateUserParams {
  authority: string;
  userDto: UserDto;
}

export interface UpdateUserParams {
  authority: string;
  userDto: UserDto;
}

export interface DeleteUserParams {
  authority: string;
}
