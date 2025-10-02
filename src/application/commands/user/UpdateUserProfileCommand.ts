export interface UpdateUserProfileCommand {
    userId: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePicture?: string;
}
