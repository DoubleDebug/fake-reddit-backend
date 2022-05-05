export type ResponseStatus =
    | {
          success: false;
          message: string;
      }
    | {
          success: true;
      };

export type ResponseStatusWithData =
    | {
          success: false;
          message: string;
      }
    | {
          success: true;
          data: {
              email?: string;
              emailVerified?: boolean;
              password?: string;
              displayName?: string;
              photoURL?: string;
          };
      };
