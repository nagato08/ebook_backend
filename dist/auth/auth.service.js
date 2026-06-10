"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../common/services/email.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    email;
    constructor(prisma, jwt, email) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.email = email;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email deja utilise');
        const hash = await bcrypt.hash(dto.password, 10);
        const verificationToken = this.email.generateToken();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hash,
                name: dto.name,
                emailVerificationToken: verificationToken,
            },
        });
        await this.prisma.creditLedger.create({
            data: {
                userId: user.id,
                delta: user.credits,
                reason: 'signup_bonus',
                balanceAfter: user.credits,
            },
        });
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        await this.email.sendVerificationEmail(user.email, verificationToken, frontendUrl);
        return this.sign(user.id, user.email, user.name, user.credits);
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        return this.sign(user.id, user.email, user.name, user.credits);
    }
    async googleLogin(profile) {
        const { email, name } = profile;
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email,
                    name,
                    password: '',
                    emailVerified: true,
                },
            });
            await this.prisma.creditLedger.create({
                data: {
                    userId: user.id,
                    delta: user.credits,
                    reason: 'signup_bonus',
                    balanceAfter: user.credits,
                },
            });
            await this.email.sendWelcomeEmail(user.email, user.name || 'User');
        }
        return this.sign(user.id, user.email, user.name, user.credits);
    }
    async sendVerificationEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        const token = this.email.generateToken();
        await this.prisma.user.update({
            where: { email },
            data: { emailVerificationToken: token },
        });
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        await this.email.sendVerificationEmail(email, token, frontendUrl);
        const isDev = process.env.NODE_ENV !== 'production';
        return {
            message: 'Email de vérification envoyé',
            ...(isDev && { token }),
        };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findUnique({
            where: { emailVerificationToken: token },
        });
        if (!user)
            throw new common_1.NotFoundException('Token invalide ou expiré');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true, emailVerificationToken: null },
        });
        return { message: 'Email vérifié avec succès' };
    }
    sign(id, email, name, credits) {
        const token = this.jwt.sign({ sub: id, email });
        return { token, user: { id, email, name, credits } };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map