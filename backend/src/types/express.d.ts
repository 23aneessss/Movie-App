declare global {
  namespace Express {
    interface Request {
      authSession?: {
        session?: {
          id: string;
        };
        user?: {
          id: string;
          name: string;
          email: string;
          image?: string | null;
          createdAt?: Date | string;
        };
      } | null;
      currentUser?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        createdAt?: Date | string;
      };
    }
  }
}

export {};
