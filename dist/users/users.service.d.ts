import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    updateProfile(userId: string, dto: UpdateProfileDto): any;
    changePassword(userId: string, dto: ChangePasswordDto): unknown;
    setAvatar(userId: string, avatarUrl: string): any;
}
