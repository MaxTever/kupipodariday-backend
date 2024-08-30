import { User } from '../users/entities/user.entity';

export interface RequestUser extends Request {
  user: User;
}
