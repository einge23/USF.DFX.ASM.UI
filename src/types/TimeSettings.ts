export type TimeSettings = {
    weekday_print_time: {
        day_max_print_hours: number;
        night_max_print_hours: number;
    };
    weekend_print_time: {
        day_max_print_hours: number;
        night_max_print_hours: number;
    };
    day_start: string;
    night_start: string;
    default_user_weekly_hours: number;
};

export type TimeSettingsState = {
    time_settings: TimeSettings;
    up_to_date: boolean;
};
