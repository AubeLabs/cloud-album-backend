// src/albums/albums.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AlbumsService {
  private oAuth2Client: OAuth2Client;

  constructor() {
    // Initialize OAuth2Client
    this.oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  /**
   * Get Albums
   * @param accessToken
   * @returns albums
   */
  async getAlbums(accessToken: string) {
    try {
      const listResponse = await axios.get(
        `${process.env.GOOGLE_PHOTHOS_LIBRARY_URL}/v1/albums`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return listResponse.data.albums;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('AxiosError:', error.response);
        throw new HttpException(
          {
            message: error.message,
            statusCode: error.response.status,
            error: error.response.data,
          },
          error.response.status,
        );
      } else if (error instanceof HttpException) {
        // HttpException 처리
        console.error('HttpException:', error);
        throw error;
      } else {
        throw new HttpException(
          'An error occurred while fetching albums from Google Photos API.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Create a new album
   * @param year
   * @param month
   * @param accessToken
   * @returns album
   */
  async createAlbum(year: number, month: number, accessToken: string) {
    const albumTitle = `${year}-${month}`;

    try {
      const response = await axios.post(
        `${process.env.GOOGLE_PHOTHOS_LIBRARY_URL}/v1/albums`,
        { album: { title: albumTitle } },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Log error and throw HttpException with detailed information
        console.error('AxiosError:', error.response);
        throw new HttpException(
          {
            message: error.message,
            statusCode: error.response.status,
            error: error.response.data,
          },
          error.response.status,
        );
      } else if (error instanceof HttpException) {
        // HttpException 처리
        console.error('HttpException:', error);
        throw error;
      } else {
        // Unexpected error
        throw new HttpException(
          'An error occurred while fetching albums from Google Photos API.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async addPhotosToAlbumByMonth(
    year: number,
    month: number,
    accessToken: string,
  ) {
    const albumTitle = `${year}-${month}`;

    try {
      const album = await this.getOrCreateAlbum(albumTitle, accessToken);
      console.log('Album Info: ', album);

      let nextPageToken: string | undefined = '';
      do {
        const response = await axios.post(
          `${process.env.GOOGLE_PHOTHOS_LIBRARY_URL}/v1/mediaItems:search`,
          {
            pageSize: 50,
            pageToken: nextPageToken,
            filters: {
              dateFilter: {
                dates: [
                  {
                    year: year,
                    month: month,
                    day: 0,
                  },
                ],
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const mediaItems = response.data.mediaItems || [];
        console.log('mediaItems Info: ', mediaItems);

        await this.addPhotosToAlbum(album.id, mediaItems, accessToken);

        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);

      return album;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('AxiosError:', error.response);
        throw new HttpException(
          {
            message: error.message,
            statusCode: error.response.status,
            error: error.response.data,
          },
          error.response.status,
        );
      } else if (error instanceof HttpException) {
        // HttpException 처리
        console.error('HttpException:', error);
        throw error;
      } else {
        throw new HttpException(
          'An error occurred while fetching albums from Google Photos API.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private async getOrCreateAlbum(title: string, accessToken: string) {
    try {
      const listResponse = await axios.get(
        `${process.env.GOOGLE_PHOTHOS_LIBRARY_URL}/v1/albums`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const album = listResponse.data.albums?.find(
        (album) => album.title === title,
      );

      if (album) {
        return album;
      } else {
        return await this.createAlbum(
          parseInt(title.split('-')[0]),
          parseInt(title.split('-')[1]),
          accessToken,
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('AxiosError:', error.response);
        throw new HttpException(
          {
            message: error.message,
            statusCode: error.response.status,
            error: error.response.data,
          },
          error.response.status,
        );
      } else if (error instanceof HttpException) {
        // HttpException 처리
        console.error('HttpException:', error);
        throw error;
      } else {
        throw new HttpException(
          'An error occurred while fetching albums from Google Photos API.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Adds one or more media items in a user's Google Photos library to an album.
   * The media items and albums must have been created by the developer via the API.
   * 사용자의 Google 포토 라이브러리에 있는 하나 이상의 미디어 항목을 앨범에 추가합니다.
   * 미디어 항목과 앨범은 개발자가 API를 통해 만든 것이어야 합니다.
   *
   * @param albumId
   * @param mediaItems
   * @param accessToken
   * @returns
   */
  private async addPhotosToAlbum(
    albumId: string,
    mediaItems: any[],
    accessToken: string,
  ) {
    if (mediaItems.length === 0) return;

    const batchAddRequest = {
      mediaItemIds: mediaItems.map((item) => item.id),
    };

    try {
      await axios.post(
        `${process.env.GOOGLE_PHOTHOS_LIBRARY_URL}/v1/albums/${albumId}:batchAddMediaItems`,
        batchAddRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('AxiosError:', error.response);
        throw new HttpException(
          {
            message: error.message,
            statusCode: error.response.status,
            error: error.response.data,
          },
          error.response.status,
        );
      } else if (error instanceof HttpException) {
        // HttpException 처리
        console.error('HttpException:', error);
        throw error;
      } else {
        throw new HttpException(
          'An error occurred while fetching albums from Google Photos API.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
