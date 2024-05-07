import { User, Roles, ModuleAccess } from '../interfaces/user.model';
import { AppActivity } from '../interfaces/app-activity.model';
import { Group } from '../interfaces/group.model';
import { Contact } from '../interfaces/contact.model';

export class DetailedUser implements User {
    $key: string= '';
    id: string= '';
    user_id: string= '';
    lastUpdated: string = new Date().toISOString();
    lastUpdatedBy: string= '';
    creatorName: string= '';
    deleted: boolean = false;
    draft: boolean = false;
    views: number = 0;
    lastViewed: string = new Date().toISOString();
    keywords: string = '';
    company_id: string = '';
    timeStamp: Date = new Date();
    bookmarked?: boolean | undefined;
    bookmarkedCount?: number | undefined;
    favored?: boolean | undefined;
    favoredCount?: number | undefined;
    broadcasted?: boolean | undefined;
    broadcastedCount?: number | undefined;


    customer_id: string = '';
    status: string = 'active';
    emailProvider?: string = '';
    email: string = '';
    name: string = '';
    helpNeeded: boolean = false;
    openView: boolean = false;
    shopping_cart_id?: string = '';
    messagesLastCheckedDate?: string;
    tasksLastCheckedDate?: string;
    alertsLastCheckedDate?: string;
    introContactImport: boolean = false;
    introCalendarImport: boolean = false;
    welcomeMessageCount: number = 0;
    workflow?: Array<any> = [];
    appActions?: Array<AppActivity> = [];
    groups?: Array<Group> = [];
    currentStep?: number;
    currentStepName?: string;
    roles: Roles = { reader: true };
    role?: string = '';
    profession?: string = '';
    gender?: string = '';
    moduleAccess?: ModuleAccess = { settings: true };
    referral?: string = '';

    constructor(init?: Partial<User>) {
        Object.assign(this, init);
    }
    contact?: Contact | undefined;

    static createDefault(): DetailedUser {
        return new DetailedUser({
            name: 'New User',
            email: 'no-email@example.com',
        });
    }
}
