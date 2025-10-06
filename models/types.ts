export type Profile = {
    id: string;
    email: string;
    username: string | null;
    avatar_url: string | null;
    followers_count: number;
    following_count: number;
};

export type Post = {
    id: string;
    content: string | null;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
};

export type Post_Comment = {
    id: string;
    post_id: string;
    user_id: string;
    comment: string | null;
    created_at:string;
}