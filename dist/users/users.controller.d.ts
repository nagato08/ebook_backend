import type { AuthUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersController {
    private users;
    constructor(users: UsersService);
    me(user: AuthUser): AuthUser;
    updateProfile(user: AuthUser, dto: UpdateProfileDto): import("@prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        credits: number;
        emailVerified: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    uploadAvatar(user: AuthUser, file?: Express.Multer.File): import("@prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        credits: number;
        emailVerified: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
