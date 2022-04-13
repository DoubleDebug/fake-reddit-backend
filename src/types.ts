export type ResponseStatus =
    | {
          success: false;
          message: string;
      }
    | {
          success: true;
      };
