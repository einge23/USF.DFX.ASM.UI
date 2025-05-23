export interface UserData {
    id: number;
    username: string;
    trained: boolean;
    admin: boolean;
    has_executive_access: boolean;
    is_egn_lab: boolean;
    ban_time_end: Date;
    weekly_minutes: number;
}
