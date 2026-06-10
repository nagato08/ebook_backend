import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    updateProfile(userId: string, dto: UpdateProfileDto): import("@prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        credits: number;
        emailVerified: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    setAvatar(userId: string, avatarUrl: string): import("@prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        credits: number;
        emailVerified: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
