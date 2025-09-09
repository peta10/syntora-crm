export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          website?: string;
          location?: string;
          role: 'user' | 'moderator' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          website?: string;
          location?: string;
          role?: 'user' | 'moderator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          username?: string;
          avatar_url?: string;
          bio?: string;
          website?: string;
          location?: string;
          role?: 'user' | 'moderator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
