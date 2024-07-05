// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  /*   async handleGoogleCallback(code: string) {
    const { tokens } = await this.oAuth2Client.getToken(code);
    const { id_token, access_token } = tokens;

    if (id_token) {
      const ticket = await this.oAuth2Client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload: TokenPayload | undefined = ticket.getPayload();
      // `payload` contains user information like email, name, etc.

      return {
        accessToken: access_token,
        idToken: id_token,
        userInfo: payload,
        code: code,
      };
    } else {
      throw new Error('No id_token found in tokens');
    }
  } */

  /**
   *
   * @param accessToken
   * @returns
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const ticket = await this.oAuth2Client.getTokenInfo(accessToken);
      console.log('Token info:', ticket);

      return !!ticket; // 유효한 경우 true 반환
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export default AuthService;
