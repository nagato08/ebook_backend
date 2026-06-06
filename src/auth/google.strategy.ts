import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';

interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Skip validation si credentials manquent (dev mode)
    const options: StrategyOptions = {
      clientID: clientID || 'placeholder-dev',
      clientSecret: clientSecret || 'placeholder-dev',
      callbackURL: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    };
    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails } = profile;
    const email = emails?.[0]?.value;

    const user = { googleId: id, email, name: displayName };
    done(null, user);
  }
}
