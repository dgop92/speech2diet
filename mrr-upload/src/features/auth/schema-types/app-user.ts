/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface AppUserCreateInput {
  data: {
    firstName: string;
    lastName: string;
    userId: string;
  };
}

export interface AppUserSearchInput {
  searchBy?: {
    id?: string;
    userId?: string;
  };
}

export interface AppUserUpdateInput {
  data: {
    firstName?: string;
    lastName?: string;
  };
  searchBy: {
    id: string;
  };
}