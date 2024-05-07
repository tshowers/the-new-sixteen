import { Contact, Company, SocialMedia, PhoneNumber, EmailAddress, Address, Engagement, ConnectionDetail, Interaction } from '../interfaces/contact.model';
import { Image } from '../interfaces/image.model';
import { JustText } from '../interfaces/just-text.model';

export class DetailedContact implements Contact {
    // Properties from State interface
    $key: string = '';
    id: string = '';
    user_id: string = '';
    lastUpdated: string = new Date().toISOString();
    lastUpdatedBy: string = '';
    creatorName: string = '';
    deleted: boolean = false;
    draft: boolean = false;
    views: number = 0;
    lastViewed: string = new Date().toISOString();
    keywords: string = '';
    company_id: string = '';
    timeStamp: Date = new Date();
    bookmarked?: boolean;
    bookmarkedCount?: number;
    favored?: boolean;
    favoredCount?: number;
    broadcasted?: boolean;
    broadcastedCount?: number;

    // Properties from Contact interface
    firstName: string = '';
    middleName?: string;
    lastName: string = '';
    isCompany?: boolean;
    ssn?: string;
    company?: Company;
    prefix?: string;
    url?: string;
    profession?: string;
    status?: string = 'active';
    profileTypes?: Array<any> = [];
    linkedInUrl?: string;
    nickname?: string;
    birthday?: string;
    anniversary?: any;
    gender?: string;
    addresses?: Array<Address> = [];
    phoneNumbers?: Array<PhoneNumber> = [];

    emailAddresses?: Array<EmailAddress> = [];
    socialMedia?: Array<SocialMedia> = [];
    notes?: Array<JustText> = [];
    dependents?: Array<any> = [];
    preferences?: Array<any> = [];
    opportunities?: Array<any> = [];
    orders?: Array<any> = [];
    FOPs?: Array<any> = [];
    events?: Array<any> = [];
    alerts?: Array<any> = [];
    projects?: Array<any> = [];
    invoices?: Array<any> = [];
    ratings?: Array<any> = [];
    images?: Array<Image> = [];
    tempScore?: number;
    shared?: boolean = false;
    systemUser?: boolean = false;
    employee?: boolean = false;
    billingRate?: number;
    loginID?: string;
    timezone?: string = 'UTC';

    engagements: Engagement[] = [];
    connectionDetails: ConnectionDetail = {
        startDate: new Date().toISOString(), // Default to current date
        mutualConnections: 0,  // Default no mutual connections
        transactionHistory: [] // Empty transaction history
    };
    interactions: Interaction[] = [];

    constructor(init?: Partial<Contact>) {
        Object.assign(this, init);

        if (init?.engagements) {
            this.engagements = init.engagements;
        }
        if (init?.connectionDetails) {
            this.connectionDetails = init.connectionDetails;
        }
        if (init?.interactions) {
            this.interactions = init.interactions;
        }
    }

    static createDefault(): DetailedContact {
        return new DetailedContact({
            firstName: '',
            middleName: '',
            lastName: '',
            images: [{
                src: 'assets/nophoto.jpg',
                alt: 'No photo available'
            }],
            company: {  // Add default company object here
                name: '',  // Default empty name
                numberOfEmployees: '', // Default value can be empty or a placeholder
                other: '', // Default or initial value
                phoneNumbers: [], // Initialize as empty array
                emailAddresses: [], // Initialize as empty array
                addresses: [], // Initialize as empty array
                url: '', // Default or initial value
                sicCode: '', // Default or initial value
                status: '', // Default or initial value
                shared: false // Default boolean value
            },
            // Default values for new properties
            connectionDetails: {
                startDate: new Date().toISOString(),  // Consider what default makes sense for your use case
                mutualConnections: 0,
                transactionHistory: []
            },
            engagements: [],
            interactions: [],
            acquisitionSource: 'Unknown'

        });
    }
}
