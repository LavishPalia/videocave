export interface IResponse<T> {
  data: null | T;
  message: string;
  statusCode: number;
  success: boolean;
}

export type TFields = "fullName" | "email" | "password";

export interface IUser {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  avatar: string;
  coverImage: string;
  watchHistory?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISearchedVideos {
  count: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  pagingCounter: number;
  prevPage: number | null;
  totalPages: number;
  totalDocs: number;
  searchedVideos: [
    {
      _id: string;
      __v: number;
      createdAt: Date;
      description: string;
      duration: number;
      isPublished: true;
      thumbnail: string;
      title: string;
      updatedAt: Date;
      videoFile: string;
      views: number;
      owner: [
        {
          _id: string;
          avatar: string;
          fullName: string;
        }
      ];
    }
  ];
}

export interface LoginApiReponse {
  user: {
    _id: string;
    userName: string;
    email: string;
    fullName: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface ISubscribedChannelDetails {
  _id: string;
  fullName: string;
  avatar: string;
  userName: string;
}

export interface IUserSubscriptionApiResponse<T> {
  subscribedChannels: T[];
  totalSubscribedChannels: number;
}

export interface IVideo {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: true;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface IComment {
  content: string;
}
