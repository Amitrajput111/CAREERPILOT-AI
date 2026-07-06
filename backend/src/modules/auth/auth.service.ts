import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, guestUserId?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    let user;
    if (guestUserId) {
      // Find the guest user
      const guest = await this.prisma.user.findUnique({
        where: { id: guestUserId },
      });
      if (guest && guest.email.startsWith('guest_')) {
        const passwordHash = await bcrypt.hash(password, 10);
        user = await this.prisma.user.update({
          where: { id: guestUserId },
          data: {
            email,
            passwordHash,
            profile: {
              update: {
                name: email.split('@')[0],
              },
            },
          },
        });
      }
    }

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          profile: {
            create: {
              name: email.split('@')[0], // Default name from email prefix
            },
          },
        },
      });

      // Create Audit Log
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
        },
      });
    } else {
      // Create Audit Log for guest upgrade
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'GUEST_UPGRADED_TO_PERMANENT',
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      userId: user.id,
      email: user.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async registerGuest() {
    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(2, 7);
    const email = `guest_${timestamp}_${rand}@careerpilot.ai`;
    const passwordHash = await bcrypt.hash('GuestPass123!', 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            name: 'Guest User',
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'GUEST_SESSION_CREATED',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      userId: user.id,
      email: user.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGGED_IN',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      userId: user.id,
      email: user.email,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(token: string) {
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshTokenRecord || refreshTokenRecord.expiresAt < new Date()) {
      if (refreshTokenRecord) {
        await this.prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    const user = refreshTokenRecord.user;
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Delete old refresh token, save new one
    await this.prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(token: string) {
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (refreshTokenRecord) {
      await this.prisma.refreshToken.delete({ where: { id: refreshTokenRecord.id } });
      // Create Audit Log
      await this.prisma.auditLog.create({
        data: {
          userId: refreshTokenRecord.userId,
          action: 'USER_LOGGED_OUT',
        },
      });
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 Days expiry

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}
