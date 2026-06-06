import type { AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    me(user: AuthUser): AuthUser;
    updateProfile(user: AuthUser, dto: UpdateProfileDto): any;
    changePassword(user: AuthUser, dto: ChangePasswordDto): unknown;
    uploadAvatar(user: AuthUser, file?: Express.Multer.File): any;
}
